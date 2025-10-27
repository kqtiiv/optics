function t = travel_time(x, y, c1, c2, L)
    t = sqrt(x.^2 + y.^2)./(c1) + sqrt((L-x).^2 + y.^2)./(c2);
end

% Variables
c1 = 300;
c2 = 400;

L = 10;
x = linspace(0, L, 1000);
y = 100;
phi = atand((L-x)./y);
theta = atand(x./y);
n = 1;
t = travel_time(x, y, c1, c2, L);

% Plot graph
figure;
plot(x, t, 'LineWidth', 2);
xlabel('x/m');
ylabel('Time of flight\s');
title('Law of refraction');
grid on;