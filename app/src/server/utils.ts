
import {RequestHandler} from 'express';

export function wrapPromiseRoute(fn: RequestHandler): RequestHandler {
    return async function(req, res, next) {
        try {
            // run controllers logic
            await fn(req, res, next);
        } catch (e) {
            // if an exception is raised, do not send any response
            // just continue performing the middleware chain
            next(e);
        }
    };
}

export function getBirthYearFromAge(age: number): number {
    return new Date().getFullYear() - age;
}
