using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Reflection;
using api.Models;
using Dapper;

namespace api.Repositories;

public class RepositoryBase<T> where T: class
{
    protected void SetTypeMap()
    {
        SqlMapper.AddTypeMap(typeof(DateTime), DbType.DateTime2);
        SqlMapper.SetTypeMap(
            typeof(T),
            new CustomPropertyTypeMap(
                typeof(T),
                (type, columnName) =>
                {
                    // Check for [Column] attribute for custom mapping
                    var property = type.GetProperties().FirstOrDefault(prop =>
                        prop.GetCustomAttributes(false)
                            .OfType<ColumnAttribute>()
                            .Any(attr => attr.Name == columnName));

                    // If no custom mapping found, fallback to default property name match
                    return property ?? type.GetProperty(columnName, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
                }));
    }
}