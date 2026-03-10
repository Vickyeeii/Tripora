"""heritage_full_module

Revision ID: 3ba6128c2c1c
Revises: 3911f976d572
Create Date: 2025-12-28 19:50:24.327430
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '3ba6128c2c1c'
down_revision: Union[str, None] = '3911f976d572'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
   

    # Heritage table changes
    op.add_column('heritage', sa.Column('is_active', sa.Boolean(), nullable=True))
    op.add_column('heritage', sa.Column('is_deleted', sa.Boolean(), nullable=True))

    op.alter_column(
        'heritage',
        'name',
        existing_type=sa.VARCHAR(length=200),
        type_=sa.String(length=150),
        existing_nullable=False
    )

    op.alter_column(
        'heritage',
        'created_at',
        existing_type=postgresql.TIMESTAMP(timezone=True),
        type_=sa.DateTime(),
        existing_nullable=True,
        existing_server_default=sa.text('now()')
    )

    op.drop_column('heritage', 'status')
    op.drop_column('heritage', 'image_cover')

    # Heritage photos enhancement
    op.add_column(
        'heritage_photos',
        sa.Column('created_at', sa.DateTime(), nullable=True)
    )


def downgrade() -> None:
    

    # Revert heritage_photos
    op.drop_column('heritage_photos', 'created_at')

    # Revert heritage columns
    op.add_column(
        'heritage',
        sa.Column('image_cover', sa.VARCHAR(length=255), nullable=True)
    )
    op.add_column(
        'heritage',
        sa.Column('status', sa.BOOLEAN(), nullable=True)
    )

    op.alter_column(
        'heritage',
        'created_at',
        existing_type=sa.DateTime(),
        type_=postgresql.TIMESTAMP(timezone=True),
        existing_nullable=True,
        existing_server_default=sa.text('now()')
    )

    op.alter_column(
        'heritage',
        'name',
        existing_type=sa.String(length=150),
        type_=sa.VARCHAR(length=200),
        existing_nullable=False
    )

    op.drop_column('heritage', 'is_deleted')
    op.drop_column('heritage', 'is_active')
