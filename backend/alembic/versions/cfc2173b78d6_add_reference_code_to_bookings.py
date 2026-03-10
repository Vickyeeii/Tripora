"""add_reference_code_to_bookings

Revision ID: cfc2173b78d6
Revises: 2e651e72fee9
Create Date: 2025-12-29 16:33:16.107331

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cfc2173b78d6'
down_revision: Union[str, None] = '2e651e72fee9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add column as nullable first
    op.add_column('bookings', sa.Column('reference_code', sa.String(length=20), nullable=True))
    
    # Generate reference codes for existing bookings
    connection = op.get_bind()
    result = connection.execute(sa.text("SELECT id FROM bookings WHERE reference_code IS NULL"))
    for row in result:
        ref_code = 'TRP-' + ''.join(__import__('secrets').choice(__import__('string').ascii_uppercase + __import__('string').digits) for _ in range(6))
        connection.execute(
            sa.text("UPDATE bookings SET reference_code = :ref WHERE id = :id"),
            {"ref": ref_code, "id": row[0]}
        )
    
    # Now make it NOT NULL and add unique constraint
    op.alter_column('bookings', 'reference_code', nullable=False)
    op.create_unique_constraint('uq_bookings_reference_code', 'bookings', ['reference_code'])


def downgrade() -> None:
    op.drop_constraint('uq_bookings_reference_code', 'bookings', type_='unique')
    op.drop_column('bookings', 'reference_code')

