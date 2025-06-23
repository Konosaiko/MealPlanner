<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\ShoppingItemRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['shopping_item:read']]),
        new GetCollection(normalizationContext: ['groups' => ['shopping_item:read']]),
        new Post(
            denormalizationContext: ['groups' => ['shopping_item:write']],
            security: "is_granted('ROLE_USER') and object.getShoppingList().getUser() == user"
        ),
        new Put(
            denormalizationContext: ['groups' => ['shopping_item:write']],
            security: "is_granted('ROLE_USER') and object.getShoppingList().getUser() == user"
        ),
        new Delete(security: "is_granted('ROLE_USER') and object.getShoppingList().getUser() == user")
    ],
    normalizationContext: ['groups' => ['shopping_item:read']],
    denormalizationContext: ['groups' => ['shopping_item:write']]
)]
#[ORM\Entity(repositoryClass: ShoppingItemRepository::class)]
class ShoppingItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['shopping_item:read', 'shopping_list:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['shopping_item:read', 'shopping_item:write', 'shopping_list:read'])]
    private ?Ingredient $ingredient = null;

    #[ORM\Column(type: Types::DECIMAL, precision: 10, scale: 2)]
    #[Groups(['shopping_item:read', 'shopping_item:write', 'shopping_list:read'])]
    private ?string $quantity = null;

    #[ORM\ManyToOne(inversedBy: 'shoppingItems')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['shopping_item:read'])]
    private ?ShoppingList $shoppingList = null;

    #[ORM\Column]
    #[Groups(['shopping_item:read', 'shopping_item:write', 'shopping_list:read'])]
    private bool $isAvailable = false;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['shopping_item:read', 'shopping_item:write', 'shopping_list:read'])]
    private ?string $notes = null;

    #[ORM\Column(length: 50)]
    #[Groups(['shopping_item:read', 'shopping_item:write', 'shopping_list:read'])]
    private ?string $unit = null;

    public function getId(): ?int
    {
        return $this->id;
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

    public function getQuantity(): ?string
    {
        return $this->quantity;
    }

    public function setQuantity(string $quantity): static
    {
        $this->quantity = $quantity;
        return $this;
    }

    public function getShoppingList(): ?ShoppingList
    {
        return $this->shoppingList;
    }

    public function setShoppingList(?ShoppingList $shoppingList): static
    {
        $this->shoppingList = $shoppingList;
        return $this;
    }

    public function isAvailable(): bool
    {
        return $this->isAvailable;
    }

    public function setIsAvailable(bool $isAvailable): static
    {
        $this->isAvailable = $isAvailable;
        return $this;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function setNotes(?string $notes): static
    {
        $this->notes = $notes;
        return $this;
    }

    public function getUnit(): ?string
    {
        return $this->unit;
    }

    public function setUnit(string $unit): static
    {
        $this->unit = $unit;
        return $this;
    }
} 