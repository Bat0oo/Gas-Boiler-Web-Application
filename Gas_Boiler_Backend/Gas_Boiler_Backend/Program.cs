using Gas_Boiler_Backend.Data;
using Gas_Boiler_Backend.Helpers;
using Gas_Boiler_Backend.Hubs;
using Gas_Boiler_Backend.Interfaces;
using Gas_Boiler_Backend.Repositories;
using Gas_Boiler_Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

namespace Gas_Boiler_Backend
{
    public class Program
    {
        // TODO: Format this better, it's awful
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            //reg repo
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<IBuildingObjectRepository, BuildingObjectRepository>();
            builder.Services.AddScoped<ISystemParametersRepository, SystemParametersRepository>();
            builder.Services.AddScoped<IGasBoilerRepository, GasBoilerRepository>();
            builder.Services.AddScoped<IBuildingReadingRepository, BuildingReadingRepository>();
            builder.Services.AddScoped<IDataManagementSettingsRepository, DataManagementSettingsRepository>();
            builder.Services.AddScoped<IAlarmRepository, AlarmRepository>();
            builder.Services.AddScoped<IAlarmSettingsRepository, AlarmSettingsRepository>();

            //reg services
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IUserService, UserService>();

            builder.Services.AddScoped<IGasBoilerService, GasBoilerService>();
            builder.Services.AddScoped<IBuildingObjectService, BuildingObjectService>();
            builder.Services.AddScoped<ISystemParametersService, SystemParametersService>();
            builder.Services.AddScoped<IBuildingCalculatorService, BuildingCalculatorService>();
            builder.Services.AddScoped<IDashboardService, DashboardService>();
            builder.Services.AddScoped<IHistoricalDataService, HistoricalDataService>();
            builder.Services.AddScoped<IDataManagementService, DataManagementService>();
            builder.Services.AddScoped<IAlarmService, AlarmService>();

            builder.Services.AddHostedService<DataRecordingBackgroundService>();
            builder.Services.AddHostedService<BoilerControlBackgroundService>();

            builder.Services.AddHttpClient<IWeatherService, OpenWeatherService>();

            builder.Services.AddScoped<JwtHelper>();

            var jwtSettings = builder.Configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];

            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
                };

                // Allow SignalR to use JWT from query string
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/boilerHub"))
                        {
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });

            builder.Services.AddControllers();
            builder.Services.AddSignalR();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter 'Bearer' followed by your JWT token"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
            });

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
                          .AllowAnyMethod()
                          .AllowAnyHeader()
                          .AllowCredentials();
                });
            });

            var app = builder.Build();


            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseStaticFiles();
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.InjectStylesheet("/swagger-ui/dark-theme.css"); // !!!! * DARK THEME FOR SWAGGER * !!!!
                }
                    );
            }

            app.UseRouting();

            app.UseHttpsRedirection();

            app.UseCors("AllowAll");

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();
            app.MapHub<BoilerHub>("/boilerHub");

            app.Run();
        }
    }
}