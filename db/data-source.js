"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
const typeorm_1 = require("typeorm");
const process = require("node:process");
const user_entity_1 = require("../src/users/entities/user.entity");
const banned_entity_1 = require("../src/banned/entities/banned.entity");
const property_entity_1 = require("../src/properties/entities/property.entity");
const otp_entity_1 = require("../src/users/entities/otp.entity");
const favorite_entity_1 = require("../src/favorite/entites/favorite.entity");
const vote_entity_1 = require("../src/votes/entities/vote.entity");
const plan_entity_1 = require("../src/plans/entities/plan.entity");
const order_entity_1 = require("../src/orders/entities/order.entity");
const view_entity_1 = require("../src/views/entities/view.entity");
const request_entity_1 = require("../src/requests/entities/request.entity");
const audit_entity_1 = require("../src/audit/entities/audit.entity");
const notification_entity_1 = require("../src/notifications/entities/notification.entity");
const dotenv_1 = require("dotenv");
const contract_entity_1 = require("../src/contracts/entities/contract.entity");
(0, dotenv_1.config)({ path: '.env' });
exports.dataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [
        contract_entity_1.Contract,
        user_entity_1.User,
        audit_entity_1.Audit,
        notification_entity_1.Notification,
        property_entity_1.Property,
        otp_entity_1.OtpEntity,
        favorite_entity_1.Favorite,
        vote_entity_1.Vote,
        plan_entity_1.Plan,
        order_entity_1.Order,
        view_entity_1.View,
        request_entity_1.Request,
        banned_entity_1.Banned,
    ],
    migrations: ['dist/db/migrations/*.js'],
    extra: {
        options: '-c timezone=+03',
    },
};
const dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = dataSource;
//# sourceMappingURL=data-source.js.map