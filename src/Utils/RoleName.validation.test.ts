import { validationRules } from './Validation';

describe('validationRules.roleName', () => {
  const roleNameValidator = validationRules.roleName();

  it('acepta nombres válidos con letras, espacios y acentos', () => {
    const validNames = [
      'Administrador',
      'Usuario Final',
      'Gerente Técnico',
      'Administrador de Área',
      'Médico Especialista',
      'Administrador Técnico',
      'Técnico en Sistemas',
      'Coordinador General'
    ];

    validNames.forEach(name => {
      expect(roleNameValidator.validate(name)).toBe(true);
    });
  });

  it('rechaza nombres con números', () => {
    const invalidNames = [
      'Admin123',
      'Usuario1',
      'Rol2024',
      'Admin 2'
    ];

    invalidNames.forEach(name => {
      expect(roleNameValidator.validate(name)).toBe(false);
    });
  });

  it('rechaza nombres con caracteres especiales', () => {
    const invalidNames = [
      'Admin@',
      'Usuario#1',
      'Rol$pecial',
      'Admin!',
      'Usuario%',
      'Rol&Co',
      'Admin*',
      'Usuario+',
      'Rol=test',
      'Admin[test]',
      'Usuario{test}',
      'Rol|test',
      'Admin\\test',
      'Usuario/test',
      'Rol?test',
      'Admin<test>',
      'Usuario"test"',
      "Rol'test'",
      'Admin`test`',
      'Usuario~test',
      'Rol^test',
      'Admin_test'
    ];

    invalidNames.forEach(name => {
      expect(roleNameValidator.validate(name)).toBe(false);
    });
  });

  it('acepta valores vacíos o nulos (para casos opcionales)', () => {
    expect(roleNameValidator.validate('')).toBe(true);
    expect(roleNameValidator.validate(null as any)).toBe(true);
    expect(roleNameValidator.validate(undefined as any)).toBe(true);
  });

  it('acepta nombres con acentos españoles', () => {
    const namesWithAccents = [
      'Médico',
      'Técnico',
      'Administración',
      'Gestión',
      'Operación',
      'Supervisión',
      'Coordinación'
    ];

    namesWithAccents.forEach(name => {
      expect(roleNameValidator.validate(name)).toBe(true);
    });
  });

  it('acepta nombres con ñ', () => {
    const namesWithÑ = [
      'Diseño',
      'Señor',
      'Niño',
      'Español'
    ];

    namesWithÑ.forEach(name => {
      expect(roleNameValidator.validate(name)).toBe(true);
    });
  });

  it('retorna el mensaje de error correcto', () => {
    expect(roleNameValidator.message).toBe('Solo se permiten letras, espacios y acentos');
  });

  it('permite personalizar el mensaje de error', () => {
    const customValidator = validationRules.roleName('Mensaje personalizado');
    expect(customValidator.message).toBe('Mensaje personalizado');
  });
});