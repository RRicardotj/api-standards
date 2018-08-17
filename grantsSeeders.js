const sequelize = require('./common/connection');

const AccessKey = require('./models/AccessKey');
const Grant = require('./models/Grants');
const GrantRole = require('./models/GrantRole');
const Widget = require('./models/Widget');

const grantsStructure = require('./common/grants.json');

const grantsSeed = async () => {
  const accessKeysSeeds = await AccessKey.seed(grantsStructure.accessKeys);

  const widgetsSeeds = await Widget.seed(grantsStructure.widgets);


  await Grant.seed(grantsStructure.grants, accessKeysSeeds, widgetsSeeds)
    .catch((err) => { throw new Error(err); });

  await GrantRole.resetSuperAdminGrants();

  // console.log('******GRANT SEEDERS COMPLETE******'); // eslint-disable-line
  console.log('\x1b[33m%s\x1b[0m', '******GRANT SEEDERS COMPLETE******'); // eslint-disable-line
  sequelize.close();
  return undefined;
};

grantsSeed().catch((err) => { throw new Error(err); });
