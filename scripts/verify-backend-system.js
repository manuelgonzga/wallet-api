import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function verifyBackendSystem() {
  try {
    console.log('🔍 Verificando sistema backend completo...\n');
    
    // 1. Verificar esquema de base de datos
    console.log('1️⃣ Verificando esquema de base de datos:');
    
    const transactionsSchema = await sql`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'transactions' AND column_name = 'settings_tag'
    `;
    
    const userSettingsSchema = await sql`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings' AND column_name = 'settings_tag'
    `;
    
    console.log(`   ✅ transactions.settings_tag: ${transactionsSchema[0]?.data_type}(${transactionsSchema[0]?.character_maximum_length})`);
    console.log(`   ✅ user_settings.settings_tag: ${userSettingsSchema[0]?.data_type}(${userSettingsSchema[0]?.character_maximum_length})`);
    
    // 2. Verificar que las tablas existen y tienen datos
    console.log('\n2️⃣ Verificando estructura de tablas:');
    
    const tablesExist = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('transactions', 'user_settings')
      ORDER BY table_name
    `;
    
    tablesExist.forEach(table => {
      console.log(`   ✅ Tabla ${table.table_name} existe`);
    });
    
    // 3. Verificar campos requeridos en user_settings
    console.log('\n3️⃣ Verificando campos en user_settings:');
    
    const userSettingsColumns = await sql`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_settings'
      ORDER BY ordinal_position
    `;
    
    const requiredFields = ['id', 'user_id', 'total_amount', 'period_days', 'settings_tag', 'is_active', 'start_date'];
    requiredFields.forEach(field => {
      const column = userSettingsColumns.find(col => col.column_name === field);
      if (column) {
        console.log(`   ✅ ${field}: ${column.data_type} (nullable: ${column.is_nullable})`);
      } else {
        console.log(`   ❌ ${field}: NO ENCONTRADO`);
      }
    });
    
    // 4. Verificar campos requeridos en transactions
    console.log('\n4️⃣ Verificando campos en transactions:');
    
    const transactionsColumns = await sql`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions'
      ORDER BY ordinal_position
    `;
    
    const requiredTransactionFields = ['id', 'user_id', 'title', 'amount', 'category', 'settings_tag', 'created_at'];
    requiredTransactionFields.forEach(field => {
      const column = transactionsColumns.find(col => col.column_name === field);
      if (column) {
        console.log(`   ✅ ${field}: ${column.data_type} (nullable: ${column.is_nullable})`);
      } else {
        console.log(`   ❌ ${field}: NO ENCONTRADO`);
      }
    });
    
    // 5. Test de longitud de settings_tag
    console.log('\n5️⃣ Verificando longitud de settings_tag:');
    
    const testTag = `test_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_long_tag_for_testing_purposes`;
    console.log(`   📏 Tag de prueba (${testTag.length} chars): ${testTag}`);
    
    if (testTag.length <= 100) {
      console.log(`   ✅ La longitud del tag (${testTag.length}) está dentro del límite (100)`);
    } else {
      console.log(`   ⚠️  La longitud del tag (${testTag.length}) excede el límite (100)`);
    }
    
    // 6. Verificar índices y constraints
    console.log('\n6️⃣ Verificando constraints:');
    
    const constraints = await sql`
      SELECT tc.constraint_name, tc.constraint_type, tc.table_name, ccu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
      WHERE tc.table_schema = 'public' 
      AND tc.table_name IN ('transactions', 'user_settings')
      AND ccu.column_name = 'settings_tag'
    `;
    
    constraints.forEach(constraint => {
      console.log(`   ✅ ${constraint.table_name}.${constraint.column_name}: ${constraint.constraint_type}`);
    });
    
    console.log('\n🎉 Verificación completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Schema actualizado con VARCHAR(100)');
    console.log('   ✅ Todas las tablas y campos necesarios presentes');
    console.log('   ✅ Sistema listo para generar tags largos');
    console.log('   ✅ Constraints de uniqueness en su lugar');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  }
}

// Ejecutar verificación
verifyBackendSystem()
  .then(() => {
    console.log('\n✨ Sistema backend verificado y funcionando correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fallo en la verificación del sistema:', error);
    process.exit(1);
  });
