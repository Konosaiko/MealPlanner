<?php

namespace App\Controller;

use App\Repository\IngredientRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class IngredientController extends AbstractController
{
    public function __construct(
        private IngredientRepository $ingredientRepository
    ) {}

    #[Route('/api/ingredients', name: 'ingredients_index', methods: ['GET', 'OPTIONS'])]
    public function getIngredients(Request $request): JsonResponse
    {
        // Gérer les requêtes OPTIONS pour CORS
        if ($request->getMethod() === 'OPTIONS') {
            $response = new JsonResponse();
            $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            return $response;
        }

        try {
            $user = $this->getUser();

            if (!$user) {
                return $this->json(['message' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
            }

            $ingredients = $this->ingredientRepository->findAll();

            // Mapper les données pour le frontend
            $result = array_map(function($ingredient) {
                return [
                    'id' => $ingredient->getId(),
                    'name' => $ingredient->getName(),
                    'unit' => $ingredient->getUnit()
                ];
            }, $ingredients);

            return $this->json($result, Response::HTTP_OK);

        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Erreur lors de la récupération des ingrédients',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 