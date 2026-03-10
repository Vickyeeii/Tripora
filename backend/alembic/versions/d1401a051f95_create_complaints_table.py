"""create_complaints_table

Revision ID: d1401a051f95
Revises: 4a32a7ff56f6
Create Date: 2025-12-30 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1401a051f95'
down_revision: Union[str, None] = '4a32a7ff56f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'complaints',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('reference_code', sa.String(20), nullable=True),
        sa.Column('tourist_id', sa.UUID(), nullable=True),
        sa.Column('heritage_id', sa.UUID(), nullable=True),
        sa.Column('event_id', sa.UUID(), nullable=True),
        sa.Column('booking_id', sa.UUID(), nullable=True),
        sa.Column('subject', sa.String(150), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('status', sa.String(20), nullable=False, server_default='open'),
        sa.Column('admin_reply', sa.Text(), nullable=True),
        sa.Column('created_by_role', sa.String(20), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['heritage_id'], ['heritage.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='SET NULL')
    )


def downgrade() -> None:
    op.drop_table('complaints')
