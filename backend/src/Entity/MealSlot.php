<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\MealSlotRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new Get(normalizationContext: ['groups' => ['meal_slot:read']]),
        new GetCollection(normalizationContext: ['groups' => ['meal_slot:read']]),
        new Post(
            denormalizationContext: ['groups' => ['meal_slot:write']],
            security: "is_granted('ROLE_USER') and object.getWeekPlanning().getOwner() == user"
        ),
        new Put(
            denormalizationContext: ['groups' => ['meal_slot:write']],
            security: "is_granted('ROLE_USER') and object.getWeekPlanning().getOwner() == user"
        ),
        new Delete(security: "is_granted('ROLE_USER') and object.getWeekPlanning().getOwner() == user")
    ],
    normalizationContext: ['groups' => ['meal_slot:read']],
    denormalizationContext: ['groups' => ['meal_slot:write']]
)]
#[ORM\Entity(repositoryClass: MealSlotRepository::class)]
class MealSlot
{
    public const LUNCH = 'lunch';
    public const DINNER = 'dinner';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['meal_slot:read'])]
    private ?int $id = null;

    #[ORM\Column(type: Types::DATE_MUTABLE)]
    #[Groups(['meal_slot:read', 'meal_slot:write'])]
    private ?\DateTimeInterface $date = null;

    #[ORM\Column(length: 20)]
    #[Groups(['meal_slot:read', 'meal_slot:write'])]
    private ?string $type = null;

    #[ORM\ManyToOne(inversedBy: 'mealSlots')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['meal_slot:read'])]
    private ?WeekPlanning $weekPlanning = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['meal_slot:read', 'meal_slot:write'])]
    private ?Meal $meal = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['meal_slot:read', 'meal_slot:write'])]
    private ?string $notes = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): static
    {
        $this->date = $date;
        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        if (!in_array($type, [self::LUNCH, self::DINNER])) {
            throw new \InvalidArgumentException('Invalid meal type');
        }
        $this->type = $type;
        return $this;
    }

    public function getWeekPlanning(): ?WeekPlanning
    {
        return $this->weekPlanning;
    }

    public function setWeekPlanning(?WeekPlanning $weekPlanning): static
    {
        $this->weekPlanning = $weekPlanning;
        return $this;
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