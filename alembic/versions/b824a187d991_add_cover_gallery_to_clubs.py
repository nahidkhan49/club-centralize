"""add cover and gallery fields to clubs table

Revision ID: b824a187d991
Revises: fa73b9e41d82
Create Date: 2026-08-29 13:28:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b824a187d991'
down_revision: Union[str, Sequence[str], None] = 'fa73b9e41d82'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('clubs', sa.Column('cover_url', sa.String(length=500), nullable=True))
    op.add_column('clubs', sa.Column('meeting_location', sa.String(length=255), nullable=True))
    op.add_column('clubs', sa.Column('meeting_time', sa.String(length=255), nullable=True))
    op.add_column('clubs', sa.Column('gallery', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('clubs', 'gallery')
    op.drop_column('clubs', 'meeting_time')
    op.drop_column('clubs', 'meeting_location')
    op.drop_column('clubs', 'cover_url')
