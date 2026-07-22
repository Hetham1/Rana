const { HttpError, conflict, notFound } = require('../errors');

const inventoryDefinitions = Object.freeze({
  wsp: {
    itemType: 'wire_spool',
    table: 'wire_spools',
    supportsRelocation: true,
    select: `
      id AS "wspId",
      direction AS "wspDirection",
      material AS "wspMaterial",
      type AS "wspType",
      production_plan_id AS "wspPp",
      state AS "wspState",
      recorded_at AS "wspDate",
      input_spool AS "wspIn",
      output_spool AS "wspOut",
      length AS "wspLength",
      empty_weight AS "wspWempty",
      full_weight AS "wspWfull",
      pure_weight AS "wspWpure",
      quality_approved AS "wspQC",
      workplace_id AS "wpId",
      location_state AS "wspLL",
      sector AS "wspSector",
      waybill_number AS "wspBj"
    `,
    dateColumn: 'recorded_at',
    materialFilterColumn: 'material',
  },
  ins: {
    itemType: 'insulation',
    table: 'insulation_batches',
    supportsRelocation: true,
    select: `
      id AS "insId",
      type AS "insType",
      code AS "insCode",
      manufacturer_id AS "manfId",
      entry_date AS "insEntryDate",
      receipt_number AS "insRecNum",
      state AS "insState",
      expires_at AS "insEXP",
      location AS "insLoc",
      color AS "insColor",
      quantity AS "insCount",
      quality_approved AS "insQC",
      workplace_id AS "wpId",
      location_state AS "insLL",
      sector AS "insSector"
    `,
    dateColumn: 'entry_date',
    colorFilterColumn: 'color',
  },
  car: {
    itemType: 'cart',
    table: 'carts',
    supportsRelocation: false,
    select: `
      id AS "cartId",
      type AS "cartType",
      device AS "cartDevice",
      input_value AS "cartIn",
      output_value AS "cartOut",
      shift AS "cartShift",
      length AS "cartLenght",
      product_name AS "prodName",
      production_plan_id AS "ppId",
      manufactured_at AS "cartMFG",
      user_id AS "userId",
      color AS "cartColor",
      insulation_batch_id AS "insulId",
      wire_spool_id AS "wireSpId",
      workplace_id AS "wpId",
      location_state AS "cartLL",
      quality_approved AS "cartQc"
    `,
    dateColumn: 'manufactured_at',
  },
  fip: {
    itemType: 'final_product',
    table: 'final_products',
    supportsRelocation: true,
    select: `
      id AS "fpId",
      type AS "fpType",
      cart_id AS "fpCart",
      user_id AS "uesrId",
      end_user_code AS "fpEndUserCode",
      location AS "fpLoc",
      situation AS "fpSituation",
      workplace_id AS "wpId",
      location_state AS "fpLL",
      sector AS "fpSector",
      is_wrapped AS "fpWrapped"
    `,
    dateColumn: 'created_at',
    typeFilterColumn: 'type',
  },
});

function getInventoryDefinition(uid) {
  const definition = inventoryDefinitions[uid.slice(0, 3).toLowerCase()];
  if (!definition) {
    throw new HttpError(400, 'پیشوند شناسه کالا معتبر نیست');
  }
  return definition;
}

/**
 * Moves an inventory item into or out of a workplace atomically and records an audit event.
 */
async function changeLocationState({ database, uid, workplaceId, action, userId }) {
  const definition = getInventoryDefinition(uid);
  const nextState = action === 'entry' ? 'ورود' : 'خروج';

  return database.withTransaction(async (client) => {
    const current = await client.query(
      `SELECT workplace_id, location_state, ${definition.table === 'final_products' ? 'true' : 'quality_approved'} AS quality_approved
       FROM ${definition.table}
       WHERE id = $1
       FOR UPDATE`,
      [uid],
    );

    if (current.rowCount === 0) {
      throw notFound('کالایی با این شناسه یافت نشد');
    }

    const item = current.rows[0];
    if (action === 'entry' && item.workplace_id === workplaceId && item.location_state === nextState) {
      throw conflict('این کالا پیش‌تر در همین محل ثبت ورود شده است');
    }
    if (action === 'exit' && (item.workplace_id !== workplaceId || item.location_state === nextState)) {
      throw conflict('کالا در این محل موجود نیست یا پیش‌تر خارج شده است');
    }

    await client.query(
      `UPDATE ${definition.table}
       SET workplace_id = CASE WHEN $1 = 'entry' THEN $2 ELSE workplace_id END,
           location_state = $3
       WHERE id = $4`,
      [action, workplaceId, nextState, uid],
    );
    await client.query(
      `INSERT INTO inventory_movements (item_type, item_id, action, workplace_id, performed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [definition.itemType, uid, action, workplaceId, userId || null],
    );

    return { qualityApproved: item.quality_approved };
  });
}

async function relocate({ database, uid, workplaceId, sector, userId }) {
  const definition = getInventoryDefinition(uid);
  if (!definition.supportsRelocation) {
    throw new HttpError(400, 'این نوع کالا از جابه‌جایی سکتور پشتیبانی نمی‌کند');
  }

  const result = await database.withTransaction(async (client) => {
    const updated = await client.query(
      `UPDATE ${definition.table}
       SET sector = $1
       WHERE id = $2
         AND workplace_id = $3
         AND sector IS DISTINCT FROM $1
       RETURNING id`,
      [sector, uid, workplaceId],
    );
    if (updated.rowCount === 0) {
      throw conflict('مکان یا سکتور کالا تغییری نکرد؛ محل فعلی کالا را بررسی کنید');
    }

    await client.query(
      `INSERT INTO inventory_movements (item_type, item_id, action, workplace_id, sector, performed_by)
       VALUES ($1, $2, 'relocate', $3, $4, $5)`,
      [definition.itemType, uid, workplaceId, sector, userId || null],
    );
    return updated.rows[0];
  });
  return result;
}

async function findById(database, uid) {
  const definition = getInventoryDefinition(uid);
  const result = await database.query(
    `SELECT ${definition.select} FROM ${definition.table} WHERE id = $1`,
    [uid],
  );
  if (result.rowCount === 0) throw notFound('اطلاعاتی برای این کالا یافت نشد');
  return result.rows;
}

module.exports = {
  inventoryDefinitions,
  getInventoryDefinition,
  changeLocationState,
  relocate,
  findById,
};
