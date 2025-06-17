<?php

namespace App\EventSubscriber;

use ApiPlatform\Symfony\EventListener\EventPriorities;
use App\Entity\Meal;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ViewEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class MealUserSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private Security $security
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::VIEW => ['setUser', EventPriorities::PRE_VALIDATE],
        ];
    }

    public function setUser(ViewEvent $event): void
    {
        $meal = $event->getControllerResult();
        if (!$meal instanceof Meal) {
            return;
        }

        // Ne définit l'utilisateur que lors de la création
        if ($meal->getUser() !== null) {
            return;
        }

        $user = $this->security->getUser();
        if ($user === null) {
            return;
        }

        $meal->setUser($user);
    }
} 