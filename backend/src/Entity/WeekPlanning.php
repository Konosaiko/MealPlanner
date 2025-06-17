<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\WeekPlanningRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['week_planning:read']]),
        new GetCollection(normalizationContext: ['groups' => ['week_planning:read']]),
        new Post(
            denormalizationContext: ['groups' => ['week_planning:write']],
            security: "is_granted('ROLE_USER')"
        ),
        new Put(
            denormalizationContext: ['groups' => ['week_planning:write']],
            security: "is_granted('ROLE_USER') and object.getOwner() == user"
        ),
        new Delete(security: "is_granted('ROLE_USER') and object.getOwner() == user")
    ],
    normalizationContext: ['groups' => ['week_planning:read']],
    denormalizationContext: ['groups' => ['week_planning:write']]
)]
#[ORM\Entity(repositoryClass: WeekPlanningRepository::class)]
class WeekPlanning
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['week_planning:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['week_planning:read', 'week_planning:write'])]
    private ?\DateTimeInterface $startDate = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['week_planning:read', 'week_planning:write'])]
    private ?\DateTimeInterface $endDate = null;

    #[ORM\ManyToOne(inversedBy: 'weekPlannings')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['week_planning:read'])]
    private ?User $owner = null;

    #[ORM\ManyToMany(targetEntity: User::class, inversedBy: 'sharedPlannings')]
    #[Groups(['week_planning:read', 'week_planning:write'])]
    private Collection $sharedWith;

    #[ORM\OneToMany(mappedBy: 'weekPlanning', targetEntity: MealSlot::class, orphanRemoval: true)]
    #[Groups(['week_planning:read'])]
    private Collection $mealSlots;

    #[ORM\OneToOne(mappedBy: 'weekPlanning', cascade: ['persist', 'remove'])]
    #[Groups(['week_planning:read'])]
    private ?ShoppingList $shoppingList = null;

    public function __construct()
    {
        $this->sharedWith = new ArrayCollection();
        $this->mealSlots = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStartDate(): ?\DateTimeInterface
    {
        return $this->startDate;
    }

    public function setStartDate(\DateTimeInterface $startDate): static
    {
        $this->startDate = $startDate;
        return $this;
    }

    public function getEndDate(): ?\DateTimeInterface
    {
        return $this->endDate;
    }

    public function setEndDate(\DateTimeInterface $endDate): static
    {
        $this->endDate = $endDate;
        return $this;
    }

    public function getOwner(): ?User
    {
        return $this->owner;
    }

    public function setOwner(?User $owner): static
    {
        $this->owner = $owner;
        return $this;
    }

    /**
     * @return Collection<int, User>
     */
    public function getSharedWith(): Collection
    {
        return $this->sharedWith;
    }

    public function addSharedWith(User $user): static
    {
        if (!$this->sharedWith->contains($user)) {
            $this->sharedWith->add($user);
        }
        return $this;
    }

    public function removeSharedWith(User $user): static
    {
        $this->sharedWith->removeElement($user);
        return $this;
    }

    /**
     * @return Collection<int, MealSlot>
     */
    public function getMealSlots(): Collection
    {
        return $this->mealSlots;
    }

    public function addMealSlot(MealSlot $mealSlot): static
    {
        if (!$this->mealSlots->contains($mealSlot)) {
            $this->mealSlots->add($mealSlot);
            $mealSlot->setWeekPlanning($this);
        }
        return $this;
    }

    public function removeMealSlot(MealSlot $mealSlot): static
    {
        if ($this->mealSlots->removeElement($mealSlot)) {
            if ($mealSlot->getWeekPlanning() === $this) {
                $mealSlot->setWeekPlanning(null);
            }
        }
        return $this;
    }

    public function getShoppingList(): ?ShoppingList
    {
        return $this->shoppingList;
    }

    public function setShoppingList(?ShoppingList $shoppingList): static
    {
        if ($shoppingList === null && $this->shoppingList !== null) {
            $this->shoppingList->setWeekPlanning(null);
        }
        if ($shoppingList !== null && $shoppingList->getWeekPlanning() !== $this) {
            $shoppingList->setWeekPlanning($this);
        }
        $this->shoppingList = $shoppingList;
        return $this;
    }
} 