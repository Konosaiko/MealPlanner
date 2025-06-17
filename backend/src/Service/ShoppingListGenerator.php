<?php

namespace App\Service;

use App\Entity\ShoppingList;
use App\Entity\ShoppingItem;
use App\Entity\WeekPlanning;
use App\Entity\MealSlot;
use App\Entity\MealIngredient;
use Doctrine\ORM\EntityManagerInterface;

class ShoppingListGenerator
{
    public function __construct(
        private EntityManagerInterface $entityManager
    ) {}

    public function generateForWeek(WeekPlanning $weekPlanning): ShoppingList
    {
        // Supprimer l'ancienne liste si elle existe
        $oldList = $weekPlanning->getShoppingList();
        if ($oldList) {
            $this->entityManager->remove($oldList);
            $this->entityManager->flush();
        }

        // Créer une nouvelle liste
        $shoppingList = new ShoppingList();
        $shoppingList->setWeekPlanning($weekPlanning);
        $shoppingList->setGeneratedAt(new \DateTime());
        $shoppingList->setIsCompleted(false);

        // Récupérer tous les repas planifiés pour la semaine
        $mealSlots = $weekPlanning->getMealSlots();
        $ingredients = [];

        foreach ($mealSlots as $slot) {
            $meal = $slot->getMeal();
            if ($meal) {
                foreach ($meal->getIngredients() as $mealIngredient) {
                    $ingredient = $mealIngredient->getIngredient();
                    $quantity = $mealIngredient->getQuantity();
                    $unit = $mealIngredient->getUnit();

                    $key = $ingredient->getId();
                    if (!isset($ingredients[$key])) {
                        $ingredients[$key] = [
                            'ingredient' => $ingredient,
                            'totalQuantity' => 0,
                            'unit' => $unit
                        ];
                    }
                    $ingredients[$key]['totalQuantity'] += $quantity;
                }
            }
        }

        // Créer les items de la liste de courses
        foreach ($ingredients as $data) {
            $item = new ShoppingItem();
            $item->setShoppingList($shoppingList);
            $item->setIngredient($data['ingredient']);
            $item->setQuantity($data['totalQuantity']);
            $item->setUnit($data['unit']);
            $item->setIsAvailable(false);
            $shoppingList->addItem($item);
        }

        // Persister la liste
        $this->entityManager->persist($shoppingList);
        $this->entityManager->flush();

        return $shoppingList;
    }
} 