# Material acumulativo de capacitación — Fase 1

## Super Admin SaaS

Objetivos de capacitación:

- entender tenant vs sede;
- crear y suspender gimnasios;
- comprender límites de plan;
- revisar matriz RBAC;
- interpretar auditoría técnica;
- no usar acceso de plataforma para consultar datos sensibles futuros.

## Propietario / Administrador

Objetivos:

- crear sedes;
- crear personal;
- asignar roles correctamente;
- cambiar sede activa;
- personalizar marca blanca;
- revisar auditoría;
- comprender que suspender conserva historial.

## Gerente de sede

Objetivos:

- entender su sede asignada;
- revisar usuarios y dashboard según permisos;
- no asumir que ocultar un botón equivale a autorización.

## Conceptos clave para diapositivas

1. Plataforma → Gimnasio → Sede → Usuario.
2. Roles determinan permisos; backend toma la decisión final.
3. Firebase valida identidad; GymFlow controla tenant, sede y autorización.
4. Los registros históricos no se borran silenciosamente.
5. Fase 2 añadirá socios y membresías sobre este núcleo.
