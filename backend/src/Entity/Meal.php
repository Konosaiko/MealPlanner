<?php

namespace App\Entity;

use App\Repository\MealRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: MealRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Meal
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['meal:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(min: 2, max: 255)]
    #[Groups(['meal:read', 'meal:write', 'user:read'])]
    private ?string $name = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['meal:read', 'meal:write'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['meal:read', 'meal:write'])]
    private ?int $preparationTime = null;

    #[ORM\OneToMany(mappedBy: 'meal', targetEntity: MealIngredient::class, cascade: ['persist', 'remove'])]
    private Collection $mealIngredients;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['meal:read'])]
    private ?User $user = null;

    #[ORM\Column]
    #[Groups(['meal:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['meal:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->mealIngredients = new ArrayCollection();
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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
        return $this;
    }

    public function getPreparationTime(): ?int
    {
        return $this->preparationTime;
    }

    public function setPreparationTime(int $preparationTime): static
    {
        $this->preparationTime = $preparationTime;
        return $this;
    }

    /**
     * @return Collection<int, MealIngredient>
     */
    public function getMealIngredients(): Collection
    {
        return $this->mealIngredients;
    }

    /**
     * Retourne les ingrédients formatés pour le frontend
     */
    #[Groups(['meal:read'])]
    public function getIngredients(): array
    {
        $ingredients = [];
        foreach ($this->mealIngredients as $mealIngredient) {
            $ingredient = $mealIngredient->getIngredient();
            if ($ingredient) {
                $ingredients[] = [
                    'name' => $ingredient->getName(),
                    'quantity' => $mealIngredient->getQuantity(),
                    'unit' => $ingredient->getUnit(),
                ];
            }
        }
        return $ingredients;
    }

    public function addIngredient(MealIngredient $ingredient): static
    {
        if (!$this->mealIngredients->contains($ingredient)) {
            $this->mealIngredients->add($ingredient);
            $ingredient->setMeal($this);
        }
        return $this;
    }

    public function removeIngredient(MealIngredient $ingredient): static
    {
        if ($this->mealIngredients->removeElement($ingredient)) {
            if ($ingredient->getMeal() === $this) {
                $ingredient->setMeal(null);
            }
        }
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

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): ?\DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }
} 