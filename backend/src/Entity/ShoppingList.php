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
            security: "is_granted('ROLE_USER') and object.getWeekPlanning().getOwner() == user"
        ),
        new Put(
            denormalizationContext: ['groups' => ['shopping_list:write']],
            security: "is_granted('ROLE_USER') and object.getWeekPlanning().getOwner() == user"
        ),
        new Delete(security: "is_granted('ROLE_USER') and object.getWeekPlanning().getOwner() == user")
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

    #[ORM\OneToOne(inversedBy: 'shoppingList', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false, unique: true)]
    #[Groups(['shopping_list:read'])]
    private ?WeekPlanning $weekPlanning = null;

    #[ORM\OneToMany(mappedBy: 'shoppingList', targetEntity: ShoppingItem::class, orphanRemoval: true)]
    #[Groups(['shopping_list:read'])]
    private Collection $items;

    #[ORM\Column(type: Types::DATETIME_MUTABLE)]
    #[Groups(['shopping_list:read'])]
    private ?\DateTimeInterface $generatedAt = null;

    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    #[Groups(['shopping_list:read'])]
    private ?\DateTimeInterface $lastUpdatedAt = null;

    #[ORM\Column]
    #[Groups(['shopping_list:read'])]
    private bool $isCompleted = false;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['shopping_list:read', 'shopping_list:write'])]
    private ?string $notes = null;

    public function __construct()
    {
        $this->items = new ArrayCollection();
        $this->generatedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getWeekPlanning(): ?WeekPlanning
    {
        return $this->weekPlanning;
    }

    public function setWeekPlanning(WeekPlanning $weekPlanning): static
    {
        $this->weekPlanning = $weekPlanning;
        return $this;
    }

    /**
     * @return Collection<int, ShoppingItem>
     */
    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(ShoppingItem $item): static
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setShoppingList($this);
        }
        return $this;
    }

    public function removeItem(ShoppingItem $item): static
    {
        if ($this->items->removeElement($item)) {
            if ($item->getShoppingList() === $this) {
                $item->setShoppingList(null);
            }
        }
        return $this;
    }

    public function getGeneratedAt(): ?\DateTimeInterface
    {
        return $this->generatedAt;
    }

    public function setGeneratedAt(\DateTimeInterface $generatedAt): static
    {
        $this->generatedAt = $generatedAt;
        return $this;
    }

    public function getLastUpdatedAt(): ?\DateTimeInterface
    {
        return $this->lastUpdatedAt;
    }

    public function setLastUpdatedAt(?\DateTimeInterface $lastUpdatedAt): static
    {
        $this->lastUpdatedAt = $lastUpdatedAt;
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