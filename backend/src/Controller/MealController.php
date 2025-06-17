<?php

namespace App\Controller;

use App\Entity\Meal;
use App\Entity\MealIngredient;
use App\Entity\Ingredient;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;

#[Route('/api/meals')]
class MealController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private SerializerInterface $serializer
    ) {}

    #[Route('', name: 'meal_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $meals = $this->entityManager->getRepository(Meal::class)->findBy(['user' => $this->getUser()]);
        
        return $this->json($meals, Response::HTTP_OK, [], ['groups' => 'meal:read']);
    }

    #[Route('/{id}', name: 'meal_show', methods: ['GET'])]
    public function show(Meal $meal): JsonResponse
    {
        if ($meal->getUser() !== $this->getUser()) {
            return $this->json(['message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        return $this->json($meal, Response::HTTP_OK, [], ['groups' => 'meal:read']);
    }

    #[Route('', name: 'meal_create', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        
        if (!isset($data['name']) || !isset($data['preparationTime'])) {
            return $this->json(['message' => 'Données manquantes'], Response::HTTP_BAD_REQUEST);
        }
        
        $meal = new Meal();
        $meal->setName($data['name']);
        $meal->setDescription($data['description'] ?? null);
        $meal->setPreparationTime((int)$data['preparationTime']);
        $meal->setUser($this->getUser());

        // Gestion des ingrédients
        if (isset($data['ingredients']) && is_array($data['ingredients'])) {
            foreach ($data['ingredients'] as $ingredientData) {
                if (empty($ingredientData['name'])) {
                    continue; // Ignorer les ingrédients vides
                }
                
                // Chercher ou créer l'ingrédient
                $ingredient = $this->entityManager->getRepository(Ingredient::class)
                    ->findOneBy(['name' => $ingredientData['name']]);
                
                if (!$ingredient) {
                    $ingredient = new Ingredient();
                    $ingredient->setName($ingredientData['name']);
                    $ingredient->setUnit($ingredientData['unit'] ?? 'unité');
                    $this->entityManager->persist($ingredient);
                }
                
                // Créer la relation MealIngredient
                $mealIngredient = new MealIngredient();
                $mealIngredient->setIngredient($ingredient);
                $mealIngredient->setQuantity((float)($ingredientData['quantity'] ?? 1));
                $meal->addIngredient($mealIngredient);
            }
        }

        $this->entityManager->persist($meal);
        $this->entityManager->flush();

        return $this->json($meal, Response::HTTP_CREATED, [], ['groups' => 'meal:read']);
    }

    #[Route('/{id}', name: 'meal_update', methods: ['PUT'])]
    public function update(Request $request, Meal $meal): JsonResponse
    {
        if ($meal->getUser() !== $this->getUser()) {
            return $this->json(['message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);

        $meal->setName($data['name']);
        $meal->setDescription($data['description'] ?? null);
        $meal->setPreparationTime((int)$data['preparationTime']);
        $meal->setUpdatedAt(new \DateTimeImmutable());

        // Mise à jour des ingrédients - supprimer les anciens
        foreach ($meal->getMealIngredients() as $mealIngredient) {
            $this->entityManager->remove($mealIngredient);
        }
        $meal->getMealIngredients()->clear();

        // Ajouter les nouveaux ingrédients
        if (isset($data['ingredients']) && is_array($data['ingredients'])) {
            foreach ($data['ingredients'] as $ingredientData) {
                if (empty($ingredientData['name'])) {
                    continue;
                }
                
                // Chercher ou créer l'ingrédient
                $ingredient = $this->entityManager->getRepository(Ingredient::class)
                    ->findOneBy(['name' => $ingredientData['name']]);
                
                if (!$ingredient) {
                    $ingredient = new Ingredient();
                    $ingredient->setName($ingredientData['name']);
                    $ingredient->setUnit($ingredientData['unit'] ?? 'unité');
                    $this->entityManager->persist($ingredient);
                }
                
                // Créer la relation MealIngredient
                $mealIngredient = new MealIngredient();
                $mealIngredient->setIngredient($ingredient);
                $mealIngredient->setQuantity((float)($ingredientData['quantity'] ?? 1));
                $meal->addIngredient($mealIngredient);
            }
        }

        $this->entityManager->flush();

        return $this->json($meal, Response::HTTP_OK, [], ['groups' => 'meal:read']);
    }

    #[Route('/{id}', name: 'meal_delete', methods: ['DELETE'])]
    public function delete(Meal $meal): JsonResponse
    {
        if ($meal->getUser() !== $this->getUser()) {
            return $this->json(['message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        $this->entityManager->remove($meal);
        $this->entityManager->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
} 