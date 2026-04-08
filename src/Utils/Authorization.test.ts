import { evaluateAccess, getUserRoleNames, getUserPermissionNames } from './Authorization';

describe('evaluateAccess', () => {
  describe('sin regla', () => {
    it('devuelve true cuando no hay regla definida', () => {
      expect(evaluateAccess({ roles: [], permissions: [] })).toBe(true);
    });

    it('devuelve true cuando la regla es undefined', () => {
      expect(evaluateAccess({ roles: ['Admin'] }, undefined)).toBe(true);
    });
  });

  describe('requireRoles', () => {
    it('devuelve true cuando el usuario tiene el rol requerido', () => {
      expect(evaluateAccess(
        { roles: ['Administrador'] },
        { requireRoles: ['Administrador'] }
      )).toBe(true);
    });

    it('devuelve true cuando el usuario tiene al menos uno de los roles', () => {
      expect(evaluateAccess(
        { roles: ['Profesor'] },
        { requireRoles: ['Administrador', 'Profesor'] }
      )).toBe(true);
    });

    it('devuelve false cuando el usuario no tiene ningún rol requerido', () => {
      expect(evaluateAccess(
        { roles: ['Profesor'] },
        { requireRoles: ['Administrador'] }
      )).toBe(false);
    });

    it('devuelve true cuando requireRoles está vacío', () => {
      expect(evaluateAccess(
        { roles: ['Profesor'] },
        { requireRoles: [] }
      )).toBe(true);
    });
  });

  describe('requireAnyPermissions', () => {
    it('devuelve true cuando el usuario tiene al menos uno de los permisos', () => {
      expect(evaluateAccess(
        { permissions: ['usuarios.view', 'roles.view'] },
        { requireAnyPermissions: ['usuarios.view'] }
      )).toBe(true);
    });

    it('devuelve false cuando el usuario no tiene ninguno de los permisos requeridos', () => {
      expect(evaluateAccess(
        { permissions: ['evidencias.view'] },
        { requireAnyPermissions: ['usuarios.view', 'roles.view'] }
      )).toBe(false);
    });

    it('devuelve true cuando requireAnyPermissions está vacío', () => {
      expect(evaluateAccess(
        { permissions: [] },
        { requireAnyPermissions: [] }
      )).toBe(true);
    });
  });

  describe('requireAllPermissions', () => {
    it('devuelve true cuando el usuario tiene todos los permisos requeridos', () => {
      expect(evaluateAccess(
        { permissions: ['usuarios.view', 'roles.view', 'evidencias.view'] },
        { requireAllPermissions: ['usuarios.view', 'roles.view'] }
      )).toBe(true);
    });

    it('devuelve false cuando el usuario falta algún permiso', () => {
      expect(evaluateAccess(
        { permissions: ['usuarios.view'] },
        { requireAllPermissions: ['usuarios.view', 'roles.view'] }
      )).toBe(false);
    });
  });

  describe('requireAnyCapabilities', () => {
    it('devuelve true cuando el usuario tiene al menos una capability requerida', () => {
      expect(evaluateAccess(
        { capabilities: ['users.manage', 'reports.view'] },
        { requireAnyCapabilities: ['users.manage'] }
      )).toBe(true);
    });

    it('devuelve false cuando el usuario no tiene ninguna capability requerida', () => {
      expect(evaluateAccess(
        { capabilities: ['reports.view'] },
        { requireAnyCapabilities: ['users.manage'] }
      )).toBe(false);
    });
  });

  describe('requireAllCapabilities', () => {
    it('devuelve true cuando el usuario tiene todas las capabilities', () => {
      expect(evaluateAccess(
        { capabilities: ['users.manage', 'roles.manage'] },
        { requireAllCapabilities: ['users.manage', 'roles.manage'] }
      )).toBe(true);
    });

    it('devuelve false cuando falta alguna capability', () => {
      expect(evaluateAccess(
        { capabilities: ['users.manage'] },
        { requireAllCapabilities: ['users.manage', 'roles.manage'] }
      )).toBe(false);
    });
  });

  describe('contexto vacío', () => {
    it('devuelve false con roles vacíos y regla de rol', () => {
      expect(evaluateAccess(
        {},
        { requireRoles: ['Administrador'] }
      )).toBe(false);
    });

    it('devuelve false con permisos vacíos y regla de permiso', () => {
      expect(evaluateAccess(
        {},
        { requireAnyPermissions: ['usuarios.view'] }
      )).toBe(false);
    });
  });
});

describe('getUserRoleNames', () => {
  it('extrae los nombres de los roles', () => {
    const roles = [{ name: 'Administrador' }, { name: 'Profesor' }];
    expect(getUserRoleNames(roles)).toEqual(['Administrador', 'Profesor']);
  });

  it('retorna array vacío cuando roles es undefined', () => {
    expect(getUserRoleNames(undefined)).toEqual([]);
  });

  it('retorna array vacío cuando roles está vacío', () => {
    expect(getUserRoleNames([])).toEqual([]);
  });
});

describe('getUserPermissionNames', () => {
  it('extrae los nombres de los permisos', () => {
    const permissions = [{ name: 'usuarios.view' }, { name: 'roles.view' }];
    expect(getUserPermissionNames(permissions)).toEqual(['usuarios.view', 'roles.view']);
  });

  it('retorna array vacío cuando permissions es undefined', () => {
    expect(getUserPermissionNames(undefined)).toEqual([]);
  });

  it('retorna array vacío cuando permissions está vacío', () => {
    expect(getUserPermissionNames([])).toEqual([]);
  });
});
