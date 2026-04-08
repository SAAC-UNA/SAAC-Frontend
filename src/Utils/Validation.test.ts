import { validationRules } from './Validation';

describe('validationRules.required', () => {
  const rule = validationRules.required();

  it('falla con string vacío', () => {
    expect(rule.validate('')).toBe(false);
  });

  it('falla con solo espacios', () => {
    expect(rule.validate('   ')).toBe(false);
  });

  it('falla con null', () => {
    expect(rule.validate(null)).toBe(false);
  });

  it('falla con array vacío', () => {
    expect(rule.validate([])).toBe(false);
  });

  it('pasa con string no vacío', () => {
    expect(rule.validate('texto')).toBe(true);
  });

  it('pasa con array no vacío', () => {
    expect(rule.validate([1])).toBe(true);
  });

  it('usa mensaje personalizado', () => {
    const r = validationRules.required('Campo obligatorio');
    expect(r.message).toBe('Campo obligatorio');
  });
});

describe('validationRules.minLength', () => {
  const rule = validationRules.minLength(5);

  it('falla si el texto tiene menos del mínimo', () => {
    expect(rule.validate('abc')).toBe(false);
  });

  it('pasa si el texto tiene exactamente el mínimo', () => {
    expect(rule.validate('abcde')).toBe(true);
  });

  it('pasa si el texto supera el mínimo', () => {
    expect(rule.validate('abcdefgh')).toBe(true);
  });

  it('pasa con string vacío (validación de requerido es separada)', () => {
    expect(rule.validate('')).toBe(true);
  });
});

describe('validationRules.maxLength', () => {
  const rule = validationRules.maxLength(10);

  it('falla si el texto supera el máximo', () => {
    expect(rule.validate('a'.repeat(11))).toBe(false);
  });

  it('pasa si el texto tiene exactamente el máximo', () => {
    expect(rule.validate('a'.repeat(10))).toBe(true);
  });

  it('pasa con string vacío', () => {
    expect(rule.validate('')).toBe(true);
  });
});

describe('validationRules.email', () => {
  const rule = validationRules.email();

  it('pasa con email válido', () => {
    expect(rule.validate('usuario@example.com')).toBe(true);
  });

  it('falla sin @', () => {
    expect(rule.validate('usuarioexample.com')).toBe(false);
  });

  it('falla sin dominio', () => {
    expect(rule.validate('usuario@')).toBe(false);
  });

  it('pasa con string vacío (requerido es separado)', () => {
    expect(rule.validate('')).toBe(true);
  });
});

describe('validationRules.roleName', () => {
  const rule = validationRules.roleName();

  it('pasa con letras simples', () => {
    expect(rule.validate('Administrador')).toBe(true);
  });

  it('pasa con letras y espacios', () => {
    expect(rule.validate('Médico Especialista')).toBe(true);
  });

  it('pasa con acentos y eñe', () => {
    expect(rule.validate('Técnico en Comunicación')).toBe(true);
  });

  it('falla con números', () => {
    expect(rule.validate('Admin123')).toBe(false);
  });

  it('falla con símbolos (@, #, _)', () => {
    expect(rule.validate('Admin@UNA')).toBe(false);
    expect(rule.validate('Rol_especial')).toBe(false);
  });

  it('pasa con string vacío', () => {
    expect(rule.validate('')).toBe(true);
  });
});

describe('validationRules.comment', () => {
  const rule = validationRules.comment();

  it('pasa con texto alfanumérico y puntuación básica', () => {
    expect(rule.validate('Comentario de prueba, ok.')).toBe(true);
  });

  it('falla con caracteres no permitidos como @', () => {
    expect(rule.validate('email@example.com')).toBe(false);
  });

  it('pasa con string vacío', () => {
    expect(rule.validate('')).toBe(true);
  });
});

describe('validationRules.minSelected', () => {
  const rule = validationRules.minSelected(2);

  it('falla si hay menos elementos que el mínimo', () => {
    expect(rule.validate([1])).toBe(false);
  });

  it('pasa con exactamente el mínimo de elementos', () => {
    expect(rule.validate([1, 2])).toBe(true);
  });

  it('pasa con más elementos que el mínimo', () => {
    expect(rule.validate([1, 2, 3])).toBe(true);
  });
});

describe('validationRules.unique', () => {
  const rule = validationRules.unique();

  it('pasa con valores únicos', () => {
    expect(rule.validate([1, 2, 3])).toBe(true);
  });

  it('falla con valores duplicados', () => {
    expect(rule.validate([1, 2, 2])).toBe(false);
  });

  it('pasa con array vacío', () => {
    expect(rule.validate([])).toBe(true);
  });

  it('pasa con valor no-array', () => {
    expect(rule.validate('no-array' as any)).toBe(true);
  });
});

describe('validationRules.custom', () => {
  it('ejecuta la función personalizada', () => {
    const rule = validationRules.custom((v: number) => v > 0, 'Debe ser positivo');
    expect(rule.validate(5)).toBe(true);
    expect(rule.validate(-1)).toBe(false);
    expect(rule.message).toBe('Debe ser positivo');
  });
});
