import 'reflect-metadata';
import { Injectable, Inject, Optional } from 'injection-js';

// Test assets for injection-js adapter integration tests

export class Database {
  connect() {
    return 'connected';
  }
}

export class Logger {
  log(message: string) {
    return message;
  }
}

export class Cache {
  get(key: string) {
    return key;
  }
}

export class Config {
  apiUrl = 'https://api.example.com';
}

// Custom injection token
export const API_URL = 'API_URL';
export const CUSTOM_TOKEN = 'CUSTOM_TOKEN';

// Simple class with @Injectable and constructor injection
@Injectable()
export class UserService {
  constructor(public database: Database, public logger: Logger) {}
}

// Class with multiple dependencies
@Injectable()
export class OrderService {
  constructor(public database: Database, public logger: Logger, public cache: Cache) {}
}

// Class with @Inject decorator for custom token
@Injectable()
export class PaymentService {
  constructor(
    public database: Database,
    @Inject(API_URL) public apiUrl: string,
    public logger: Logger
  ) {}
}

// Class with @Optional decorator
@Injectable()
export class NotificationService {
  constructor(public logger: Logger, @Optional() public cache?: Cache) {}
}

// Class with no dependencies
@Injectable()
export class UtilityService {
  someMethod() {
    return 'utility';
  }
}

// Class with single dependency
@Injectable()
export class SingleDepService {
  constructor(public logger: Logger) {}
}

// Class without @Injectable (should work but may have limited reflection)
export class PlainService {
  constructor(public database: Database) {}
}
