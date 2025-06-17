<?php

namespace App\Repository;

use App\Entity\WeekPlanning;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<WeekPlanning>
 *
 * @method WeekPlanning|null find($id, $lockMode = null, $lockVersion = null)
 * @method WeekPlanning|null findOneBy(array $criteria, array $orderBy = null)
 * @method WeekPlanning[]    findAll()
 * @method WeekPlanning[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class WeekPlanningRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WeekPlanning::class);
    }

    public function save(WeekPlanning $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(WeekPlanning $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
} 