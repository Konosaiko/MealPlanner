<?php

namespace App\Repository;

use App\Entity\MealIngredient;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MealIngredient>
 *
 * @method MealIngredient|null find($id, $lockMode = null, $lockVersion = null)
 * @method MealIngredient|null findOneBy(array $criteria, array $orderBy = null)
 * @method MealIngredient[]    findAll()
 * @method MealIngredient[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MealIngredientRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MealIngredient::class);
    }

    public function save(MealIngredient $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(MealIngredient $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
} 