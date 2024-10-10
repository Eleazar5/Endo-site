module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true
      },
      auth_otp: {
        type: DataTypes.STRING(6),
        defaultValue: null
      },
      otp_createdat: {
        type: DataTypes.DATE,
        defaultValue: null
      },
      firstname: {
        type: DataTypes.STRING(200),
        defaultValue: null
      },
      lastname: {
        type: DataTypes.STRING(200),
        defaultValue: null
      },
      password: {
        type: DataTypes.STRING(200),
        defaultValue: null
      },
      phone_number: {
        type: DataTypes.STRING(200),
        defaultValue: null
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      update_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      login_trials: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        defaultValue: 0
      }
    }, {
      tableName: 'tb_users',
      timestamps: false
    });
  
    return User;
  };
  