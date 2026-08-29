"""create membership_requests table

Revision ID: fa73b9e41d82
Revises: ec90fc4b324d
Create Date: 2026-08-29 12:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fa73b9e41d82'
down_revision: Union[str, Sequence[str], None] = 'ec90fc4b324d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'membership_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('club_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='PENDING'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('reviewed_by_id', sa.Integer(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['club_id'], ['clubs.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reviewed_by_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_membership_requests_id'), 'membership_requests', ['id'], unique=False)
    op.create_index(op.f('ix_membership_requests_club_id'), 'membership_requests', ['club_id'], unique=False)
    op.create_index(op.f('ix_membership_requests_user_id'), 'membership_requests', ['user_id'], unique=False)
    op.create_index(op.f('ix_membership_requests_status'), 'membership_requests', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_membership_requests_status'), table_name='membership_requests')
    op.drop_index(op.f('ix_membership_requests_user_id'), table_name='membership_requests')
    op.drop_index(op.f('ix_membership_requests_club_id'), table_name='membership_requests')
    op.drop_index(op.f('ix_membership_requests_id'), table_name='membership_requests')
    op.drop_table('membership_requests')
