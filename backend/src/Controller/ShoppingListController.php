<?php

namespace App\Controller;

use App\Entity\ShoppingList;
use App\Entity\WeekPlanning;
use App\Service\ShoppingListGenerator;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Security;

#[Route('/api/shopping-list')]
class ShoppingListController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ShoppingListGenerator $shoppingListGenerator
    ) {}

    #[Route('/generate/{date}', name: 'shopping_list_generate', methods: ['POST'])]
    public function generateShoppingList(string $date): JsonResponse
    {
        try {
            // Vérifier si une liste existe déjà pour cette semaine
            $weekPlanning = $this->entityManager->getRepository(WeekPlanning::class)
                ->findOneBy(['startDate' => new \DateTime($date)]);

            if (!$weekPlanning) {
                // Créer un nouveau planning pour la semaine
                $weekPlanning = new WeekPlanning();
                $weekPlanning->setStartDate(new \DateTime($date));
                $weekPlanning->setEndDate((new \DateTime($date))->modify('+6 days'));
                $weekPlanning->setOwner($this->getUser());
                $this->entityManager->persist($weekPlanning);
            }

            // Vérifier si une liste existe déjà
            $existingList = $this->entityManager->getRepository(ShoppingList::class)
                ->findOneBy(['weekPlanning' => $weekPlanning]);

            if ($existingList) {
                // Supprimer l'ancienne liste
                $this->entityManager->remove($existingList);
                $this->entityManager->flush();
            }

            // Générer la nouvelle liste
            $shoppingList = $this->shoppingListGenerator->generateForWeek($weekPlanning);
            
            return $this->json([
                'message' => 'Liste de courses générée avec succès',
                'shoppingList' => $shoppingList
            ], 200, [], ['groups' => ['shopping_list:read']]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la génération de la liste de courses: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/{date}', name: 'shopping_list_get', methods: ['GET'])]
    public function getShoppingList(string $date): JsonResponse
    {
        try {
            $weekPlanning = $this->entityManager->getRepository(WeekPlanning::class)
                ->findOneBy(['startDate' => new \DateTime($date)]);

            if (!$weekPlanning) {
                return $this->json([
                    'error' => 'Planning non trouvé pour cette semaine'
                ], 404);
            }

            $shoppingList = $this->entityManager->getRepository(ShoppingList::class)
                ->findOneBy(['weekPlanning' => $weekPlanning]);

            if (!$shoppingList) {
                return $this->json([
                    'error' => 'Liste de courses non trouvée'
                ], 404);
            }

            return $this->json($shoppingList, 200, [], ['groups' => ['shopping_list:read']]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la récupération de la liste de courses: ' . $e->getMessage()
            ], 500);
        }
    }

    #[Route('/{date}/check', name: 'shopping_list_check', methods: ['POST'])]
    public function checkIngredient(Request $request, string $date): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);
            $ingredientId = $data['ingredientId'] ?? null;
            $isAvailable = $data['isAvailable'] ?? false;

            if (!$ingredientId) {
                return $this->json([
                    'error' => 'ID de l\'ingrédient manquant'
                ], 400);
            }

            $weekPlanning = $this->entityManager->getRepository(WeekPlanning::class)
                ->findOneBy(['startDate' => new \DateTime($date)]);

            if (!$weekPlanning) {
                return $this->json([
                    'error' => 'Planning non trouvé pour cette semaine'
                ], 404);
            }

            $shoppingList = $this->entityManager->getRepository(ShoppingList::class)
                ->findOneBy(['weekPlanning' => $weekPlanning]);

            if (!$shoppingList) {
                return $this->json([
                    'error' => 'Liste de courses non trouvée'
                ], 404);
            }

            $item = $this->entityManager->getRepository(ShoppingItem::class)
                ->findOneBy([
                    'shoppingList' => $shoppingList,
                    'ingredient' => $ingredientId
                ]);

            if (!$item) {
                return $this->json([
                    'error' => 'Ingrédient non trouvé dans la liste'
                ], 404);
            }

            $item->setIsAvailable($isAvailable);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'État de l\'ingrédient mis à jour',
                'item' => $item
            ], 200, [], ['groups' => ['shopping_list:read']]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Erreur lors de la mise à jour de l\'ingrédient: ' . $e->getMessage()
            ], 500);
        }
    }
} 