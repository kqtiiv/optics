function t = travel_time(x, y, c, n, L)
    t = sqrt(x.^2 + y.^2)./(c./n) + sqrt((L-x).^2 + y.^2)./(c./n);
end

% Variables
L = 20;
x = linspace(0, L, 1000);
c = 300;
y = 100;
n = 1;
t = travel_time(x, y, c, n, L);

% Plot graph
figure;
plot(x, t, 'LineWidth', 2);
xlabel('x/m');
ylabel('Time of flight\s');
title('Law of reflection');
grid on;