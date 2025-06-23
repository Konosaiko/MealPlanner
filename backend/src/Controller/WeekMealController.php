<?php

namespace App\Controller;

use App\Entity\WeekMeal;
use App\Entity\Meal;
use App\Repository\WeekMealRepository;
use App\Repository\MealRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class WeekMealController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private WeekMealRepository $weekMealRepository,
        private MealRepository $mealRepository
    ) {}

    public function getWeekMeals(Request $request): JsonResponse
    {
        $weekStart = $request->query->get('weekStart');
        
        if (!$weekStart) {
            return $this->json(['message' => 'weekStart parameter is required'], Response::HTTP_BAD_REQUEST);
        }
        
        try {
            $weekStartDate = new \DateTimeImmutable($weekStart);
            $weekMeals = $this->weekMealRepository->findByWeekAndUser($weekStartDate, $this->getUser());
            
            return $this->json($weekMeals, Response::HTTP_OK, [], ['groups' => ['week_meal:read', 'meal:read']]);
        } catch (\Exception $e) {
            return $this->json(['message' => 'Invalid date format'], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/api/week-meals', name: 'week_meal_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        $meal = $this->mealRepository->find($data['mealId']);
        if (!$meal) {
            return $this->json(['message' => 'Repas non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $weekMeal = new WeekMeal();
        $weekMeal->setMeal($meal);
        $weekMeal->setDay($data['day']);
        $weekMeal->setPeriod($data['period']);
        $weekMeal->setWeekStart(new \DateTimeImmutable($data['weekStart']));
        $weekMeal->setPortions($data['portions'] ?? 1);
        $weekMeal->setUser($this->getUser());

        $this->entityManager->persist($weekMeal);
        $this->entityManager->flush();

        return $this->json($weekMeal, Response::HTTP_CREATED, [], ['groups' => ['week_meal:read', 'meal:read']]);
    }

    #[Route('/api/week-meals/{id}', name: 'week_meal_delete', methods: ['DELETE'])]
    public function delete(WeekMeal $weekMeal): JsonResponse
    {
        if ($weekMeal->getUser() !== $this->getUser()) {
            return $this->json(['message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        $this->entityManager->remove($weekMeal);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
} 