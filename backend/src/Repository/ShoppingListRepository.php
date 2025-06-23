<?php

namespace App\Repository;

use App\Entity\ShoppingList;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ShoppingList>
 *
 * @method ShoppingList|null find($id, $lockMode = null, $lockVersion = null)
 * @method ShoppingList|null findOneBy(array $criteria, array $orderBy = null)
 * @method ShoppingList[]    findAll()
 * @method ShoppingList[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ShoppingListRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ShoppingList::class);
    }

    public function save(ShoppingList $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ShoppingList $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function findOneByWeekAndUserWithItems(\DateTimeImmutable $weekStart, $user): ?ShoppingList
    {
        return $this->createQueryBuilder('sl')
            ->select('sl', 'si', 'i')
            ->leftJoin('sl.shoppingItems', 'si')
            ->leftJoin('si.ingredient', 'i')
            ->where('sl.weekStart = :weekStart')
            ->andWhere('sl.user = :user')
            ->setParameter('weekStart', $weekStart)
            ->setParameter('user', $user)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return ShoppingList[]
     */
    public function findByUserWithStats($user): array
    {
        return $this->createQueryBuilder('sl')
            ->select('sl', 'si', 'i')
            ->leftJoin('sl.shoppingItems', 'si')
            ->leftJoin('si.ingredient', 'i')
            ->where('sl.user = :user')
            ->setParameter('user', $user)
            ->orderBy('sl.weekStart', 'DESC')
            ->getQuery()
            ->getResult();
    }
} 