<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Delete;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Seuls les administrateurs peuvent voir la liste des utilisateurs."
        ),
        new Post(
            validationContext: ['groups' => ['Default', 'user:create']],
            security: "is_granted('PUBLIC_ACCESS')"
        ),
        new Get(
            security: "is_granted('ROLE_ADMIN') or object == user",
            securityMessage: "Vous ne pouvez voir que votre propre profil."
        ),
        new Put(
            security: "is_granted('ROLE_ADMIN') or object == user",
            securityMessage: "Vous ne pouvez modifier que votre propre profil."
        ),
        new Patch(
            security: "is_granted('ROLE_ADMIN') or object == user",
            securityMessage: "Vous ne pouvez modifier que votre propre profil."
        ),
        new Delete(
            security: "is_granted('ROLE_ADMIN')",
            securityMessage: "Seuls les administrateurs peuvent supprimer des utilisateurs."
        )
    ],
    normalizationContext: ['groups' => ['user:read']],
    denormalizationContext: ['groups' => ['user:write']]
)]
#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_EMAIL', fields: ['email'])]
#[ORM\HasLifecycleCallbacks]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    #[Assert\NotBlank]
    #[Assert\Email]
    #[Groups(['user:read', 'user:write'])]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['user:read', 'user:write'])]
    private ?string $firstName = null;

    #[ORM\Column(length: 255)]
    #[Assert\NotBlank]
    #[Groups(['user:read', 'user:write'])]
    private ?string $lastName = null;

    /**
     * @var list<string> The user roles
     */
    #[ORM\Column]
    #[Groups(['user:read'])]
    private array $roles = [];

    /**
     * @var string The hashed password
     */
    #[ORM\Column]
    private ?string $password = null;

    #[Assert\NotBlank(groups: ['user:create'])]
    #[Assert\Length(min: 6, groups: ['user:create', 'user:write'])]
    #[Groups(['user:create', 'user:write'])]
    private ?string $plainPassword = null;

    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    #[Groups(['user:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Meal::class, orphanRemoval: true)]
    #[Groups(['user:read'])]
    private Collection $meals;

    #[ORM\OneToMany(mappedBy: 'owner', targetEntity: WeekPlanning::class, orphanRemoval: true)]
    private Collection $weekPlannings;

    #[ORM\ManyToMany(targetEntity: WeekPlanning::class, mappedBy: 'sharedWith')]
    private Collection $sharedPlannings;

    public function __construct()
    {
        $this->meals = new ArrayCollection();
        $this->weekPlannings = new ArrayCollection();
        $this->sharedPlannings = new ArrayCollection();
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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function setFirstName(string $firstName): static
    {
        $this->firstName = $firstName;
        return $this;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function setLastName(string $lastName): static
    {
        $this->lastName = $lastName;
        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    /**
     * @param list<string> $roles
     */
    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    /**
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
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

    /**
     * @see UserInterface
     */
    public function eraseCredentials(): void
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    /**
     * @return Collection<int, Meal>
     */
    public function getMeals(): Collection
    {
        return $this->meals;
    }

    public function addMeal(Meal $meal): static
    {
        if (!$this->meals->contains($meal)) {
            $this->meals->add($meal);
            $meal->setUser($this);
        }

        return $this;
    }

    public function removeMeal(Meal $meal): static
    {
        if ($this->meals->removeElement($meal)) {
            // set the owning side to null (unless already changed)
            if ($meal->getUser() === $this) {
                $meal->setUser(null);
            }
        }

        return $this;
    }

    public function getPlainPassword(): ?string
    {
        return $this->plainPassword;
    }

    public function setPlainPassword(?string $plainPassword): self
    {
        $this->plainPassword = $plainPassword;
        return $this;
    }

    /**
     * @return Collection<int, WeekPlanning>
     */
    public function getWeekPlannings(): Collection
    {
        return $this->weekPlannings;
    }

    public function addWeekPlanning(WeekPlanning $weekPlanning): static
    {
        if (!$this->weekPlannings->contains($weekPlanning)) {
            $this->weekPlannings->add($weekPlanning);
            $weekPlanning->setOwner($this);
        }
        return $this;
    }

    public function removeWeekPlanning(WeekPlanning $weekPlanning): static
    {
        if ($this->weekPlannings->removeElement($weekPlanning)) {
            if ($weekPlanning->getOwner() === $this) {
                $weekPlanning->setOwner(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, WeekPlanning>
     */
    public function getSharedPlannings(): Collection
    {
        return $this->sharedPlannings;
    }

    public function addSharedPlanning(WeekPlanning $sharedPlanning): static
    {
        if (!$this->sharedPlannings->contains($sharedPlanning)) {
            $this->sharedPlannings->add($sharedPlanning);
            $sharedPlanning->addSharedWith($this);
        }
        return $this;
    }

    public function removeSharedPlanning(WeekPlanning $sharedPlanning): static
    {
        if ($this->sharedPlannings->removeElement($sharedPlanning)) {
            $sharedPlanning->removeSharedWith($this);
        }
        return $this;
    }
}
