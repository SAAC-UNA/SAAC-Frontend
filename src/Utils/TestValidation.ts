import { validationRules } from './Validation';

// Test rápido de la validación roleName
const testRoleName = () => {
  const validator = validationRules.roleName();
  
  console.log('=== TESTING ROLE NAME VALIDATION ===');
  
  // Casos que deberían FALLAR
  const invalidCases = ['=isn', 'Admin123', 'User@UNA', 'Rol_test'];
  console.log('\n❌ Testing INVALID cases:');
  invalidCases.forEach(testCase => {
    const result = validator.validate(testCase);
    console.log(`"${testCase}": ${result ? '✅ PASSED' : '❌ FAILED'} - ${result ? 'UNEXPECTED!' : 'Expected failure'}`);
  });
  
  // Casos que deberían PASAR
  const validCases = ['Administrador', 'Médico Especialista', 'Técnico en Sistemas'];
  console.log('\n✅ Testing VALID cases:');
  validCases.forEach(testCase => {
    const result = validator.validate(testCase);
    console.log(`"${testCase}": ${result ? '✅ PASSED' : '❌ FAILED'} - ${result ? 'Expected success' : 'UNEXPECTED!'}`);
  });
  
  console.log('\n📝 Validation message:', validator.message);
  console.log('🔍 Regex pattern:', /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/);
};

// Export para poder usar en consola del navegador
(window as any).testRoleName = testRoleName;

export { testRoleName };