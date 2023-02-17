---
id: create-volume
title: Create Volume
sidebar_label: Create Volume
---

## PV and PVCs

### Creating PVC
对 PVC 的简单介绍

**Prerequisite**

Ensure that there is already a StorageClass available for use.

**Procedure**
1. Create and configure the YAML file.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: iomesh-example-pvc
    spec:
      storageClassName: iomesh-example-sc
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 10Gi
    ```
   Refer to k8s for configurations.

2. Run the command to create a PVC.

   ```
   $ kubectl create -f pvc-1.yml
   ```

   Once created, IOMesh will sense this PVC, create a new PV based on the spec in that PVC, and bind it to that PVC. Once done, PV and PVC are available for pod use.

3. Run the following command to check for results.

   ```
   $ kubectl get pvc pvc-1.yml
   ```
