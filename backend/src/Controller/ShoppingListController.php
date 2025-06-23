<?php

namespace App\Controller;

use App\Entity\ShoppingList;
use App\Entity\ShoppingItem;
use App\Entity\Ingredient;
use App\Repository\ShoppingListRepository;
use App\Repository\WeekMealRepository;
use App\Repository\IngredientRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class ShoppingListController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private ShoppingListRepository $shoppingListRepository,
        private WeekMealRepository $weekMealRepository,
        private IngredientRepository $ingredientRepository
    ) {}

    #[Route('/api/shopping-lists', name: 'shopping_lists_index', methods: ['GET'])]
    public function getShoppingLists(): JsonResponse
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                return $this->json(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
            }

            // Récupérer toutes les listes de courses de l'utilisateur avec compteurs
            $shoppingLists = $this->shoppingListRepository->findByUserWithStats($user);

            // Mapper les données pour le frontend
            $result = array_map(function($list) {
                $totalItems = count($list->getShoppingItems());
                $completedItems = 0;
                
                foreach ($list->getShoppingItems() as $item) {
                    if ($item->isAvailable()) {
                        $completedItems++;
                    }
                }

                return [
                    'id' => $list->getId(),
                    'weekStart' => $list->getWeekStart()->format('Y-m-d'),
                    'createdAt' => $list->getCreatedAt()->format('c'),
                    'itemCount' => $totalItems,
                    'completedItems' => $completedItems,
                    'isCompleted' => $totalItems > 0 && $completedItems === $totalItems
                ];
            }, $shoppingLists);

            // Trier par date de semaine décroissante (plus récent en premier)
            usort($result, function($a, $b) {
                return strtotime($b['weekStart']) - strtotime($a['weekStart']);
            });

            return $this->json($result, Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la récupération des listes de courses',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/shopping-list/generate/{weekStart}', name: 'shopping_list_generate', methods: ['POST'])]
    public function generateShoppingList(string $weekStart): JsonResponse
    {
        try {
            $weekStartDate = new \DateTimeImmutable($weekStart);
            $user = $this->getUser();

            if (!$user) {
                return $this->json(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
            }

            // Vérifier si une liste existe déjà pour cette semaine
            $existingList = $this->shoppingListRepository->findOneBy([
                'weekStart' => $weekStartDate,
                'user' => $user
            ]);

            if ($existingList) {
                // Supprimer les anciens éléments
                foreach ($existingList->getShoppingItems() as $item) {
                    $this->entityManager->remove($item);
                }
                $this->entityManager->flush();
            } else {
                // Créer une nouvelle liste
                $existingList = new ShoppingList();
                $existingList->setWeekStart($weekStartDate);
                $existingList->setUser($user);
                $existingList->setCreatedAt(new \DateTimeImmutable());
                $this->entityManager->persist($existingList);
            }

            // Récupérer tous les repas de la semaine
            $weekMeals = $this->weekMealRepository->findByWeekAndUser($weekStartDate, $user);

            // Collecter tous les ingrédients avec leurs quantités ajustées selon les portions
            $ingredients = [];
            foreach ($weekMeals as $weekMeal) {
                $meal = $weekMeal->getMeal();
                $plannedPortions = $weekMeal->getPortions();
                $basePortions = $meal->getPortions();
                
                // Calculer le ratio d'ajustement des portions
                $portionRatio = $basePortions > 0 ? $plannedPortions / $basePortions : 1;
                
                foreach ($meal->getMealIngredients() as $mealIngredient) {
                    $ingredient = $mealIngredient->getIngredient();
                    $key = $ingredient->getId();
                    
                    if (!isset($ingredients[$key])) {
                        $ingredients[$key] = [
                            'ingredient' => $ingredient,
                            'quantity' => 0,
                            'unit' => $ingredient->getUnit()
                        ];
                    }
                    
                    // Ajuster la quantité selon le ratio de portions
                    $adjustedQuantity = $mealIngredient->getQuantity() * $portionRatio;
                    $ingredients[$key]['quantity'] += $adjustedQuantity;
                }
            }

            // Créer les éléments de la liste de courses
            foreach ($ingredients as $ingredientData) {
                $shoppingItem = new ShoppingItem();
                $shoppingItem->setShoppingList($existingList);
                $shoppingItem->setIngredient($ingredientData['ingredient']);
                $shoppingItem->setQuantity($ingredientData['quantity']);
                $shoppingItem->setUnit($ingredientData['unit']);
                $shoppingItem->setIsAvailable(false);
                
                $this->entityManager->persist($shoppingItem);
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Liste de courses générée avec succès',
                'shoppingListId' => $existingList->getId(),
                'itemsCount' => count($ingredients)
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la génération de la liste de courses',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/shopping-list/{weekStart}', name: 'shopping_list_get', methods: ['GET'])]
    public function getShoppingList(string $weekStart): JsonResponse
    {
        try {
            $weekStartDate = new \DateTimeImmutable($weekStart);
            $user = $this->getUser();

            if (!$user) {
                return $this->json(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
            }

            // Utiliser une requête avec jointure pour charger les relations
            $shoppingList = $this->shoppingListRepository->findOneByWeekAndUserWithItems($weekStartDate, $user);

            if (!$shoppingList) {
                return $this->json(['message' => 'Liste de courses non trouvée'], Response::HTTP_NOT_FOUND);
            }

            // Mapper manuellement les données pour s'assurer que isAvailable est bien inclus
            $result = [
                'id' => $shoppingList->getId(),
                'weekStart' => $shoppingList->getWeekStart()->format('Y-m-d'),
                'createdAt' => $shoppingList->getCreatedAt()->format('c'),
                'shoppingItems' => array_map(function($item) {
                    return [
                        'id' => $item->getId(),
                        'quantity' => $item->getQuantity(),
                        'unit' => $item->getUnit(),
                        'isAvailable' => $item->isAvailable(), // S'assurer que cette valeur est bien présente
                        'ingredient' => [
                            'id' => $item->getIngredient()->getId(),
                            'name' => $item->getIngredient()->getName()
                        ]
                    ];
                }, $shoppingList->getShoppingItems()->toArray())
            ];

            return $this->json($result, Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la récupération de la liste de courses',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/shopping-list/{id}/save', name: 'shopping_list_save', methods: ['POST', 'OPTIONS'])]
    public function saveShoppingList(int $id, Request $request): JsonResponse
    {
        // Gérer les requêtes OPTIONS pour CORS
        if ($request->getMethod() === 'OPTIONS') {
            $response = new JsonResponse();
            $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
            $response->headers->set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            return $response;
        }

        try {
            $user = $this->getUser();

            if (!$user) {
                return $this->json(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
            }

            $shoppingList = $this->shoppingListRepository->find($id);

            if (!$shoppingList) {
                return $this->json(['message' => 'Liste de courses non trouvée'], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que l'utilisateur est propriétaire de la liste
            if ($shoppingList->getUser() !== $user) {
                return $this->json(['message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
            }

            // Marquer la liste comme sauvegardée (optionnel, selon vos besoins)
            $shoppingList->setUpdatedAt(new \DateTimeImmutable());
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Liste de courses sauvegardée avec succès'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la sauvegarde de la liste de courses',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/shopping-list/item/{id}', name: 'shopping_item_update', methods: ['PUT', 'OPTIONS'])]
    public function updateShoppingItem(int $id, Request $request): JsonResponse
    {
        // Gérer les requêtes OPTIONS pour CORS
        if ($request->getMethod() === 'OPTIONS') {
            $response = new JsonResponse();
            $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
            $response->headers->set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            return $response;
        }

        try {
            $shoppingItem = $this->entityManager->getRepository(ShoppingItem::class)->find($id);

            if (!$shoppingItem) {
                return $this->json(['message' => 'Élément non trouvé'], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que l'utilisateur est propriétaire de la liste
            if ($shoppingItem->getShoppingList()->getUser() !== $this->getUser()) {
                return $this->json(['message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
            }

            $data = json_decode($request->getContent(), true);

            // Mettre à jour la quantité et l'unité
            if (isset($data['quantity'])) {
                $shoppingItem->setQuantity($data['quantity']);
            }

            if (isset($data['unit'])) {
                $shoppingItem->setUnit($data['unit']);
            }

            // Gérer le changement d'ingrédient
            if (isset($data['ingredientName'])) {
                $currentIngredient = $shoppingItem->getIngredient();
                $newIngredientName = $data['ingredientName'];
                
                // Si le nom a changé
                if ($currentIngredient->getName() !== $newIngredientName) {
                    // Chercher d'abord un ingrédient existant avec ce nom
                    $existingIngredient = $this->ingredientRepository->findOneBy(['name' => $newIngredientName]);
                    
                    if ($existingIngredient) {
                        // Utiliser l'ingrédient existant
                        $shoppingItem->setIngredient($existingIngredient);
                    } else {
                        // Modifier l'ingrédient actuel au lieu d'en créer un nouveau
                        // Cela préserve les liens avec les repas existants
                        $currentIngredient->setName($newIngredientName);
                        if (isset($data['unit'])) {
                            $currentIngredient->setUnit($data['unit']);
                        }
                        // Pas besoin de persist car l'entité est déjà managée
                    }
                }
            }

            $this->entityManager->flush();

            return $this->json([
                'message' => 'Élément mis à jour avec succès'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la mise à jour de l\'élément',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/shopping-list/item/{id}', name: 'shopping_item_delete', methods: ['DELETE', 'OPTIONS'])]
    public function deleteShoppingItem(int $id, Request $request): JsonResponse
    {
        // Gérer les requêtes OPTIONS pour CORS
        if ($request->getMethod() === 'OPTIONS') {
            $response = new JsonResponse();
            $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
            $response->headers->set('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            return $response;
        }

        try {
            $shoppingItem = $this->entityManager->getRepository(ShoppingItem::class)->find($id);

            if (!$shoppingItem) {
                return $this->json(['message' => 'Élément non trouvé'], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que l'utilisateur est propriétaire de la liste
            if ($shoppingItem->getShoppingList()->getUser() !== $this->getUser()) {
                return $this->json(['message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
            }

            $this->entityManager->remove($shoppingItem);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Élément supprimé avec succès'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la suppression de l\'élément',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/shopping-list/{id}/item', name: 'shopping_item_add', methods: ['POST', 'OPTIONS'])]
    public function addShoppingItem(int $id, Request $request): JsonResponse
    {
        // Gérer les requêtes OPTIONS pour CORS
        if ($request->getMethod() === 'OPTIONS') {
            $response = new JsonResponse();
            $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
            $response->headers->set('Access-Control-Allow-Methods', 'POST, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            return $response;
        }

        try {
            $user = $this->getUser();

            if (!$user) {
                return $this->json(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
            }

            $shoppingList = $this->shoppingListRepository->find($id);

            if (!$shoppingList) {
                return $this->json(['message' => 'Liste de courses non trouvée'], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que l'utilisateur est propriétaire de la liste
            if ($shoppingList->getUser() !== $user) {
                return $this->json(['message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
            }

            $data = json_decode($request->getContent(), true);

            // Trouver ou créer l'ingrédient
            $ingredient = $this->ingredientRepository->findOneBy(['name' => $data['ingredientName']]);
            
            if (!$ingredient) {
                // Créer un nouvel ingrédient s'il n'existe pas
                $ingredient = new Ingredient();
                $ingredient->setName($data['ingredientName']);
                $ingredient->setUnit($data['unit'] ?? 'pièce');
                $this->entityManager->persist($ingredient);
            }

            // Créer le nouvel élément de liste
            $shoppingItem = new ShoppingItem();
            $shoppingItem->setShoppingList($shoppingList);
            $shoppingItem->setIngredient($ingredient);
            $shoppingItem->setQuantity($data['quantity']);
            $shoppingItem->setUnit($data['unit'] ?? 'pièce');
            $shoppingItem->setIsAvailable(false);

            $this->entityManager->persist($shoppingItem);
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Élément ajouté avec succès'
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de l\'ajout de l\'élément',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/api/shopping-list/item/{id}/toggle', name: 'shopping_item_toggle', methods: ['PATCH', 'OPTIONS'])]
    public function toggleShoppingItem(int $id, Request $request): JsonResponse
    {
        // Gérer les requêtes OPTIONS pour CORS
        if ($request->getMethod() === 'OPTIONS') {
            $response = new JsonResponse();
            $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
            $response->headers->set('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            return $response;
        }

        try {
            $shoppingItem = $this->entityManager->getRepository(ShoppingItem::class)->find($id);

            if (!$shoppingItem) {
                return $this->json(['message' => 'Élément non trouvé'], Response::HTTP_NOT_FOUND);
            }

            // Vérifier que l'utilisateur est propriétaire de la liste
            if ($shoppingItem->getShoppingList()->getUser() !== $this->getUser()) {
                return $this->json(['message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
            }

            $shoppingItem->setIsAvailable(!$shoppingItem->isAvailable());
            $this->entityManager->flush();

            return $this->json([
                'message' => 'Statut mis à jour',
                'isAvailable' => $shoppingItem->isAvailable()
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la mise à jour',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 