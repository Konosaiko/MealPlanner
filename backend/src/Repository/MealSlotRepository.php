<?php

namespace App\Repository;

use App\Entity\MealSlot;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MealSlot>
 *
 * @method MealSlot|null find($id, $lockMode = null, $lockVersion = null)
 * @method MealSlot|null findOneBy(array $criteria, array $orderBy = null)
 * @method MealSlot[]    findAll()
 * @method MealSlot[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class MealSlotRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MealSlot::class);
    }

    public function save(MealSlot $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(MealSlot $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
} 