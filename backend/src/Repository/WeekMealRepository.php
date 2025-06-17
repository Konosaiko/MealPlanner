<?php

namespace App\Repository;

use App\Entity\WeekMeal;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<WeekMeal>
 *
 * @method WeekMeal|null find($id, $lockMode = null, $lockVersion = null)
 * @method WeekMeal|null findOneBy(array $criteria, array $orderBy = null)
 * @method WeekMeal[]    findAll()
 * @method WeekMeal[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class WeekMealRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WeekMeal::class);
    }

    /**
     * @return WeekMeal[]
     */
    public function findByWeekAndUser(\DateTimeInterface $weekStart, User $user): array
    {
        return $this->createQueryBuilder('wm')
            ->andWhere('wm.weekStart = :weekStart')
            ->andWhere('wm.user = :user')
            ->setParameter('weekStart', $weekStart)
            ->setParameter('user', $user)
            ->orderBy('wm.day', 'ASC')
            ->getQuery()
            ->getResult();
    }
} 