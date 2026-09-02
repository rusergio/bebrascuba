<?php

namespace App\Http\Concerns;

use App\Models\User;

trait AuthorizesAccess
{
    protected function userRoleNames(User $user): array
    {
        return $user->roles()
            ->where('roles.estado', true)
            ->pluck('rol')
            ->toArray();
    }

    protected function userHasAnyRole(User $user, array $roles): bool
    {
        return !empty(array_intersect($roles, $this->userRoleNames($user)));
    }

    protected function isAdminOrCoordinator(User $user): bool
    {
        return $this->userHasAnyRole($user, [
            'Administrador',
            'Coordinador Nacional',
            'Coordinador Asistente',
            'Coordinador Provincial MINED',
            'Coordinador Municipal MINED',
        ]);
    }

    protected function canAccessUserAccount(User $authUser, int $targetUserId): bool
    {
        return $authUser->id === $targetUserId || $this->isAdminOrCoordinator($authUser);
    }

    /**
     * IDs válidos en profesor_estudiante para un profesor.
     * Incluye user_id solo como legacy si no existe otro profesor con ese id numérico.
     */
    protected function idsProfesorParaVinculos(int $profesorId, int $userId): array
    {
        $ids = [$profesorId];

        if ($userId !== $profesorId && !\App\Models\Profesor::where('id', $userId)->exists()) {
            $ids[] = $userId;
        }

        return array_values(array_unique($ids));
    }
}
