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
   For details, refer to Kubernetes documentation.
  

2. Run the following command to create a PVC.

   ```
   $ kubectl create -f pvc-1.yml
   ```
   Once created, IOMesh will sense this PVC and create a new PV based on the `spec` in this PVC, binding the PV with this PVC. Then this pair of PV and PVC will be available for pod use.

3. Run the following command to check for results.

   ```
   $ kubectl get pvc pvc-1.yml
   ```

4. 加一个查看 PV 的命令
   