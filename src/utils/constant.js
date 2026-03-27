const ALLOWED_POSITIONS = ['QB', 'RB', 'WR', 'TE'];
const ALLOWED_FIELD_MAP = {
    'WR': 'fan_pts_allow_wr',
    'RB': 'fan_pts_allow_rb',
    'QB': 'fan_pts_allow_qb',
    'TE': 'fan_pts_allow_te'
};

module.exports = { ALLOWED_POSITIONS, ALLOWED_FIELD_MAP}; 