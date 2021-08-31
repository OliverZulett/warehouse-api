import express from 'express';
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import dbConfig from './config/database.config';
import Logger from './lib/logger';
import { HealthCheckRoute } from './routes/healthCheck.route';
import { ProductRoute } from './routes/product.route';

class App {
  public app: express.Application;
  private healthCheckRoute: HealthCheckRoute;
  private productRoute: ProductRoute;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.dbConfiguration()
      .then(() => this.routes())
      .catch(error => Logger.error(`Error loading routes, ${error}`));
  }

  private async dbConfiguration() {
    await createConnection(dbConfig)
      .then(
        connection =>
          connection.isConnected &&
          Logger.info(`Database connected on PORT: ${process.env.DB_PORT}`)
      )
      .catch(error => Logger.error(`Error connecting database, ${error}`));
  }

  private routes() {
    this.healthCheckRoute = new HealthCheckRoute();
    this.productRoute = new ProductRoute();
    this.productRoute.routes(this.app);
    this.healthCheckRoute.routes(this.app);
  }
}

export default new App().app;
