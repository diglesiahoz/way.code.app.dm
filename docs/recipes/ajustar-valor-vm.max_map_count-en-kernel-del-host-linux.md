---
title: Ajustar valor "vm.max_map_count" en kernel del host (linux)
sidebar_label: Ajustar valor "vm.max_map_count" en kernel del host (linux)
sidebar_position: 1.0
slug: /recipes/ajustar-valor-vm.max_map_count-en-kernel-del-host-linux
tags: [core, configuración]
---

# Ajustar valor "vm.max_map_count" en kernel del host (linux)

:::warning
Necesario para SonarQube
:::

- Ajuste temporal
```
sudo sysctl -w vm.max_map_count=262144
```

- Ajuste permanente
```
echo | echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```