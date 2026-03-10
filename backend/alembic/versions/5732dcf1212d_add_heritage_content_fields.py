"""add_heritage_content_fields

Revision ID: 5732dcf1212d
Revises: 3ba6128c2c1c
Create Date: 2025-12-28 21:37:23.313289

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5732dcf1212d'
down_revision: Union[str, None] = '3ba6128c2c1c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('heritage', sa.Column('short_description', sa.Text(), nullable=True))
    op.add_column('heritage', sa.Column('historical_overview', sa.Text(), nullable=True))
    op.add_column('heritage', sa.Column('cultural_significance', sa.Text(), nullable=True))
    op.add_column('heritage', sa.Column('best_time_to_visit', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('heritage', 'best_time_to_visit')
    op.drop_column('heritage', 'cultural_significance')
    op.drop_column('heritage', 'historical_overview')
    op.drop_column('heritage', 'short_description')

