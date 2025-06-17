<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\MealIngredientRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous devez être connecté pour voir les ingrédients des repas."
        ),
        new Post(
            security: "is_granted('ROLE_USER')",
            securityMessage: "Vous devez être connecté pour ajouter des ingrédients aux repas."
        ),
        new Get(
            security: "is_granted('ROLE_USER') and object.getMeal().getUser() == user",
            securityMessage: "Vous ne pouvez voir que les ingrédients de vos propres repas."
        ),
        new Put(
            security: "is_granted('ROLE_USER') and object.getMeal().getUser() == user",
            securityMessage: "Vous ne pouvez modifier que les ingrédients de vos propres repas."
        ),
        new Delete(
            security: "is_granted('ROLE_USER') and object.getMeal().getUser() == user",
            securityMessage: "Vous ne pouvez supprimer que les ingrédients de vos propres repas."
        )
    ],
    normalizationContext: ['groups' => ['meal_ingredient:read']],
    denormalizationContext: ['groups' => ['meal_ingredient:write']]
)]
#[ORM\Entity(repositoryClass: MealIngredientRepository::class)]
#[ORM\HasLifecycleCallbacks]
class MealIngredient
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['meal_ingredient:read', 'meal:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'mealIngredients')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['meal_ingredient:read'])]
    private ?Meal $meal = null;

    #[ORM\ManyToOne(inversedBy: 'mealIngredients')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['meal_ingredient:read', 'meal_ingredient:write', 'meal:read'])]
    private ?Ingredient $ingredient = null;

    #[ORM\Column]
    #[Assert\NotNull]
    #[Assert\Positive]
    #[Groups(['meal_ingredient:read', 'meal_ingredient:write', 'meal:read'])]
    private ?float $quantity = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['meal_ingredient:read', 'meal_ingredient:write', 'meal:read'])]
    private ?string $optional = null;

    #[ORM\Column]
    #[Groups(['meal_ingredient:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['meal_ingredient:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function setUpdatedAtValue(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMeal(): ?Meal
    {
        return $this->meal;
    }

    public function setMeal(?Meal $meal): static
    {
        $this->meal = $meal;
        return $this;
    }

    public function getIngredient(): ?Ingredient
    {
        return $this->ingredient;
    }

    public function setIngredient(?Ingredient $ingredient): static
    {
        $this->ingredient = $ingredient;
        return $this;
    }

    public function getQuantity(): ?float
    {
        return $this->quantity;
    }

    public function setQuantity(float $quantity): static
    {
        $this->quantity = $quantity;
        return $this;
    }

    public function getOptional(): ?string
    {
        return $this->optional;
    }

    public function setOptional(?string $optional): static
    {
        $this->optional = $optional;
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }
} 