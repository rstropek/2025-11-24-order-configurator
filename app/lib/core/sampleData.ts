import { buildZodSchemaForCategory, CategoryDefinition, Product } from "./products";

export const categoryDefinitions: CategoryDefinition[] = [
    {
        id: "platform",
        name: "Platform",
        properties: [
            {
                key: "lengthCm",
                label: "Platform Length (cm)",
                kind: "number",
                min: 50,
                max: 500,
                required: true,
            },
            {
                key: "maxLoadKg",
                label: "Max Load (kg)",
                kind: "number",
                min: 100,
                max: 2000,
                required: true,
            },
            {
                key: "isOutdoorRated",
                label: "Outdoor Rated",
                kind: "boolean",
                required: true,
            },
        ],
    },

    {
        id: "clamp",
        name: "Clamp",
        properties: [
            {
                key: "sizeCm",
                label: "Clamp Size (cm)",
                kind: "number",
                min: 1,
                max: 20,
                required: true,
            },
            {
                key: "maxTorqueNm",
                label: "Max Torque (Nm)",
                kind: "number",
                min: 10,
                max: 200,
                required: true,
            },
            {
                key: "isAutomatic",
                label: "Automatic Mode",
                kind: "boolean",
                required: true,
            },
        ],
    },

    {
        id: "controller",
        name: "Controller",
        properties: [
            {
                key: "maxChannels",
                label: "Max Channels",
                kind: "number",
                min: 1,
                max: 16,
                required: true,
            },
            {
                key: "supportsAutomaticClamps",
                label: "Supports Automatic Clamps",
                kind: "boolean",
                required: true,
            },
            {
                key: "hasBatteryBackup",
                label: "Battery Backup",
                kind: "boolean",
                required: true,
            },
        ],
    },
];

export const products: Product[] = [
    {
        id: "platform-modern-200",
        name: "Modern Platform 200",
        categoryId: "platform",
        properties: {
            lengthCm: 200,
            maxLoadKg: 500,
            isOutdoorRated: true,
        },
        dependencies: [
            {
                // Requires at least 4 clamps
                categoryId: "clamp",
                minCount: 4,
                propertyConstraints: [
                    {
                        key: "sizeCm",
                        kind: "number",
                        min: 8, // Clamps must be at least 8cm
                    },
                ],
            },
            {
                // Requires 1 controller
                categoryId: "controller",
                minCount: 1,
                propertyConstraints: [
                    {
                        key: "maxChannels",
                        kind: "number",
                        min: 4, // Controller must support at least 4 channels
                    },
                ],
            },
        ],
    },
    {
        id: "platform-compact-120",
        name: "Compact Platform 120",
        categoryId: "platform",
        properties: {
            lengthCm: 120,
            maxLoadKg: 300,
            isOutdoorRated: false,
        },
        dependencies: [
            {
                // Requires at least 2 clamps
                categoryId: "clamp",
                minCount: 2,
                propertyConstraints: [
                    {
                        key: "sizeCm",
                        kind: "number",
                        min: 5, // Clamps must be at least 5cm
                    },
                ],
            },
            {
                // Requires 1 controller
                categoryId: "controller",
                minCount: 1,
            },
        ],
    },

    {
        id: "clamp-auto-10",
        name: "AutoClamp 10",
        categoryId: "clamp",
        properties: {
            sizeCm: 10,
            maxTorqueNm: 50,
            isAutomatic: true,
        },
        dependencies: [
            {
                // Automatic clamps require a controller that supports them
                categoryId: "controller",
                minCount: 1,
                propertyConstraints: [
                    {
                        key: "supportsAutomaticClamps",
                        kind: "boolean",
                        value: true,
                    },
                ],
            },
        ],
    },
    {
        id: "clamp-manual-5",
        name: "ManualClamp 5",
        categoryId: "clamp",
        properties: {
            sizeCm: 5,
            maxTorqueNm: 30,
            isAutomatic: false,
        },
        // Manual clamps have no dependencies
    },

    {
        id: "controller-basic-4",
        name: "Basic Controller 4",
        categoryId: "controller",
        properties: {
            maxChannels: 4,
            supportsAutomaticClamps: false,
            hasBatteryBackup: false,
        },
        // Controllers have no dependencies
    },
    {
        id: "controller-pro-8",
        name: "Pro Controller 8",
        categoryId: "controller",
        properties: {
            maxChannels: 8,
            supportsAutomaticClamps: true,
            hasBatteryBackup: true,
        },
        // Controllers have no dependencies
    },
];

export const categorySchemas = new Map<string, ReturnType<typeof buildZodSchemaForCategory>>();

for (const cat of categoryDefinitions) {
    categorySchemas.set(cat.id, buildZodSchemaForCategory(cat));
}
