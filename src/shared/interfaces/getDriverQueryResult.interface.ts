import { AmpDriver } from './ampDriver.interface';

export interface GetDriverQueryResult extends AmpDriver {
    auto_driver_schedule_id: number;
}
