"""create_bookings_table

Revision ID: 2e651e72fee9
Revises: 59002f5eec75
Create Date: 2025-12-29 14:05:49.803076

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2e651e72fee9'
down_revision: Union[str, None] = '59002f5eec75'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'bookings',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('heritage_id', sa.UUID(), nullable=False),
        sa.Column('event_id', sa.UUID(), nullable=True),
        sa.Column('visitor_name', sa.String(150), nullable=False),
        sa.Column('visitor_phone', sa.String(20), nullable=False),
        sa.Column('visitor_email', sa.String(150), nullable=True),
        sa.Column('visit_date', sa.Date(), nullable=False),
        sa.Column('visit_time', sa.Time(), nullable=True),
        sa.Column('people_count', sa.Integer(), nullable=False),
        sa.Column('created_by_role', sa.String(20), nullable=False),
        sa.Column('created_by_id', sa.UUID(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['heritage_id'], ['heritage.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE')
    )


def downgrade() -> None:
    op.drop_table('bookings')

