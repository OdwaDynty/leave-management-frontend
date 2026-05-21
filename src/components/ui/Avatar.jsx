// ─── AVATAR COMPONENT ─────────────────────────────────
// Displays a user's initials in a coloured circle
// Used in the sidebar, header, and employee lists
// Falls back to initials when no photo is available

const Avatar = ({ name = '', size = 36, color = '#4F46E5' }) => {
  // Extract initials from the full name
  // e.g. "Odwa Dlamini" → "OD"
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2); // Max 2 initials

  const styles = {
    container: {
      width:           size,
      height:          size,
      borderRadius:    '50%',
      background:      color,
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      color:           'white',
      fontSize:        size * 0.36,
      fontWeight:      '600',
      flexShrink:      0,
      userSelect:      'none',
    },
  };

  return (
    <div style={styles.container}>
      {initials || '?'}
    </div>
  );
};

export default Avatar;