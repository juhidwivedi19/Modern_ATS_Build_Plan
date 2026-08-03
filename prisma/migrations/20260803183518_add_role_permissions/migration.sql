-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('ORGANIZATION_VIEW', 'ORGANIZATION_UPDATE', 'ORGANIZATION_DELETE', 'MEMBER_VIEW', 'MEMBER_INVITE', 'MEMBER_REMOVE', 'MEMBER_ROLE_UPDATE', 'DEPARTMENT_VIEW', 'DEPARTMENT_CREATE', 'DEPARTMENT_UPDATE', 'DEPARTMENT_DELETE');

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" SERIAL NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "permission" "Permission" NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_permission_key" ON "RolePermission"("role", "permission");
