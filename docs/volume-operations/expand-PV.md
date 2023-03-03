---
id: expand-volume
title: Expand Volume
sidebar_label: Expand Volume
---

## Expanding PVC

修改 PVC 里面的参数，之后创建的 PV 会按修改后的容量来

**Prerequisites**
- Volume expansion support for PVC is in Kubernetes 1.11 or above, which is already required in [Prerequisites](#prerequisites).
- The StorageClass must set `allowVolumeExpansion` to true. The default StorageClass `iomesh-csi-driver` already does this. If a StorageClass is created and configured with custom parameters, verify that its `allowVolumeExpansion` is set to "true". 


**Procedure**

1. Create and configure the YAML file. The following example assumes a PVC named `example-pvc` with a capacity of `10Gi`.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: example-pvc
    spec:
      storageClassName: iomesh-csi-driver-default
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 10Gi # The original capacity of the PVC.
    ```
2. Run the following command to apply the YAML file. (这里不像是 apply 命令，像是 get 命令？)

   ```bash
   kubectl get pvc example-pvc
   ```
   After running the command, you should see an example like like this:
   ```output
   NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
   example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   10Gi        RWO            iomesh-csi-driver-default   11m
   ```

3. Set the field `storage` to a new value such as 20Gi.

   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
   name: example-pvc
    spec:
      storageClassName: iomesh-csi-driver-default
      accessModes:
        - ReadWriteOnce
    resources:
      requests:
        storage: 20Gi # Expand capacity from 10 Gi to 20Gi.
    ```

3. Run the following command to apply the new YAML file.

   ```bash
   kubectl apply -f example-pvc.yaml
   ```

4. Run the following command to check the capacity of the PVC.

   ```bash
   kubectl get pvc example-pvc 
   ```

   After running the command, you should see an example below:

   ```output
   NAME          STATUS   VOLUME                                     CAPACITY    ACCESS MODES   STORAGECLASS                AGE
   example-pvc   Bound    pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi        RWO            iomesh-csi-driver-default   11m
   ```

5. Run the following command to check the PV capacity.
   ```bash
   kubectl get pv pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca 
   ```

   After running the command, you should see an example like this:
   ```output
   NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM                 STORAGECLASS
   pvc-b2fc8425-9dbc-4204-8240-41cb4a7fa8ca   20Gi       Retain           Bound    default/example-pvc   iomesh-csi-driver-default
   ```
