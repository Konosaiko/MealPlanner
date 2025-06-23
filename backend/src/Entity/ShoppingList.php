<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\ShoppingListRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['shopping_list:read']]),
        new GetCollection(normalizationContext: ['groups' => ['shopping_list:read']]),
        new Post(
            denormalizationContext: ['groups' => ['shopping_list:write']],
            security: "is_granted('ROLE_USER') and object.getUser() == user"
        ),
        new Put(
            denormalizationContext: ['groups' => ['shopping_list:write']],
            security: "is_granted('ROLE_USER') and object.getUser() == user"
        ),
        new Delete(security: "is_granted('ROLE_USER') and object.getUser() == user")
    ],
    normalizationContext: ['groups' => ['shopping_list:read']],
    denormalizationContext: ['groups' => ['shopping_list:write']]
)]
#[ORM\Entity(repositoryClass: ShoppingListRepository::class)]
class ShoppingList
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['shopping_list:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_IMMUTABLE)]
    #[Groups(['shopping_list:read'])]
    private ?\DateTimeImmutable $weekStart = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['shopping_list:read'])]
    private ?User $user = null;

    #[ORM\OneToMany(mappedBy: 'shoppingList', targetEntity: ShoppingItem::class, orphanRemoval: true)]
    #[Groups(['shopping_list:read'])]
    private Collection $shoppingItems;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    #[Groups(['shopping_list:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    #[Groups(['shopping_list:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column]
    #[Groups(['shopping_list:read'])]
    private bool $isCompleted = false;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['shopping_list:read', 'shopping_list:write'])]
    private ?string $notes = null;

    public function __construct()
    {
        $this->shoppingItems = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getWeekStart(): ?\DateTimeImmutable
    {
        return $this->weekStart;
    }

    public function setWeekStart(\DateTimeImmutable $weekStart): static
    {
        $this->weekStart = $weekStart;
        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    /**
     * @return Collection<int, ShoppingItem>
     */
    public function getShoppingItems(): Collection
    {
        return $this->shoppingItems;
    }

    public function addShoppingItem(ShoppingItem $shoppingItem): static
    {
        if (!$this->shoppingItems->contains($shoppingItem)) {
            $this->shoppingItems->add($shoppingItem);
            $shoppingItem->setShoppingList($this);
        }
        return $this;
    }

    public function removeShoppingItem(ShoppingItem $shoppingItem): static
    {
        if ($this->shoppingItems->removeElement($shoppingItem)) {
            if ($shoppingItem->getShoppingList() === $this) {
                $shoppingItem->setShoppingList(null);
            }
        }
        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function isCompleted(): bool
    {
        return $this->isCompleted;
    }

    public function setIsCompleted(bool $isCompleted): static
    {
        $this->isCompleted = $isCompleted;
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
} 