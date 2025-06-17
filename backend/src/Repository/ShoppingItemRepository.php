<?php

namespace App\Repository;

use App\Entity\ShoppingItem;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ShoppingItem>
 *
 * @method ShoppingItem|null find($id, $lockMode = null, $lockVersion = null)
 * @method ShoppingItem|null findOneBy(array $criteria, array $orderBy = null)
 * @method ShoppingItem[]    findAll()
 * @method ShoppingItem[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ShoppingItemRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ShoppingItem::class);
    }

    public function save(ShoppingItem $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(ShoppingItem $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }
} 